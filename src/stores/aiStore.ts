import { create } from 'zustand';
import { AIAgent, AgentCapability, AgentLog, AIChatMessage, AIModelId } from '@/types';
import { generateId } from '@/lib/utils';
import { llmEngine, getModelInfo } from '@/lib/webllm';

interface AIState {
  agents: AIAgent[];
  currentAgentId: string | null;
  addAgent: (name: string, model: AIModelId, systemPrompt: string, capabilities: AgentCapability[]) => AIAgent;
  updateAgent: (id: string, updates: Partial<AIAgent>) => void;
  deleteAgent: (id: string) => void;
  setCurrentAgent: (id: string | null) => void;
  addLog: (agentId: string, type: AgentLog['type'], message: string) => void;
  clearLogs: (agentId: string) => void;
  runAgent: (id: string) => void;
  stopAgent: (id: string) => void;
  sendMessage: (agentId: string, content: string) => Promise<void>;
  addChatMessage: (agentId: string, message: AIChatMessage) => void;
  updateLastChatMessage: (agentId: string, content: string) => void;
  clearChat: (agentId: string) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  agents: [
    {
      id: 'agent-1', name: 'Code Assistant',
      description: 'Helps with code review, debugging, and improvements',
      model: 'phi-3.5-mini' as AIModelId,
      systemPrompt: 'You are a helpful code assistant. You help with code review, debugging, writing code, and answering programming questions. Be concise and practical. If you cannot actually perform an action (like accessing files or running code), say so honestly.',
      capabilities: ['read-pages', 'write-pages', 'manage-issues'],
      status: 'idle', createdAt: new Date().toISOString(), logs: [],
      chatHistory: [],
    },
    {
      id: 'agent-2', name: 'Daily Planner',
      description: 'Helps plan your day, set goals, and track progress',
      model: 'qwen-2.5-3b' as AIModelId,
      systemPrompt: 'You are a productivity assistant. Help the user plan their day, set and track goals, manage their calendar, and stay organized. Be encouraging but realistic. If you cannot actually modify their calendar or tasks, say so honestly and offer advice instead.',
      capabilities: ['read-pages', 'read-calendar', 'manage-goals'],
      status: 'idle', createdAt: new Date().toISOString(), logs: [],
      chatHistory: [],
    },
  ],
  currentAgentId: null,

  addAgent: (name, model, systemPrompt, capabilities) => {
    const agent: AIAgent = {
      id: generateId(), name, model, systemPrompt, capabilities,
      status: 'idle', createdAt: new Date().toISOString(), logs: [],
      chatHistory: [],
    };
    set((state) => ({ agents: [...state.agents, agent] }));
    return agent;
  },

  updateAgent: (id, updates) => {
    set((state) => ({ agents: state.agents.map((a) => a.id === id ? { ...a, ...updates } : a) }));
  },

  deleteAgent: (id) => {
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      currentAgentId: state.currentAgentId === id ? null : state.currentAgentId,
    }));
  },

  setCurrentAgent: (id) => set({ currentAgentId: id }),

  addLog: (agentId, type, message) => {
    const log: AgentLog = { id: generateId(), timestamp: new Date().toISOString(), type, message };
    set((state) => ({
      agents: state.agents.map((a) => a.id === agentId ? { ...a, logs: [...a.logs, log] } : a),
    }));
  },

  clearLogs: (agentId) => {
    set((state) => ({
      agents: state.agents.map((a) => a.id === agentId ? { ...a, logs: [] } : a),
    }));
  },

  runAgent: (id) => {
    set((state) => ({
      agents: state.agents.map((a) => a.id === id ? { ...a, status: 'running' as const, lastRun: new Date().toISOString() } : a),
    }));
  },

  stopAgent: (id) => {
    llmEngine.stopGeneration();
    set((state) => ({
      agents: state.agents.map((a) => a.id === id ? { ...a, status: 'idle' as const } : a),
    }));
  },

  addChatMessage: (agentId, message) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, chatHistory: [...a.chatHistory, message] } : a
      ),
    }));
  },

  updateLastChatMessage: (agentId, content) => {
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id !== agentId || a.chatHistory.length === 0) return a;
        const updated = [...a.chatHistory];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content, isStreaming: false };
        return { ...a, chatHistory: updated };
      }),
    }));
  },

  clearChat: (agentId) => {
    set((state) => ({
      agents: state.agents.map((a) => a.id === agentId ? { ...a, chatHistory: [] } : a),
    }));
  },

  sendMessage: async (agentId, content) => {
    const state = get();
    const agent = state.agents.find((a) => a.id === agentId);
    if (!agent) return;

    const userMsg: AIChatMessage = {
      id: generateId(), role: 'user', content, timestamp: new Date().toISOString(),
    };
    state.addChatMessage(agentId, userMsg);

    const assistantMsg: AIChatMessage = {
      id: generateId(), role: 'assistant', content: '', timestamp: new Date().toISOString(), isStreaming: true,
    };
    state.addChatMessage(agentId, assistantMsg);

    try {
      const modelInfo = getModelInfo(agent.model);

      if (!llmEngine.isModelLoaded() || llmEngine.getLoadedModel() !== modelInfo.webllmId) {
        state.updateAgent(agentId, { status: 'loading', modelLoadProgress: 0, modelLoadStatus: 'Initializing...' });

        await llmEngine.loadModel(agent.model, (progress) => {
          state.updateAgent(agentId, {
            modelLoadProgress: progress.progress,
            modelLoadStatus: progress.text,
          });
        });

        state.updateAgent(agentId, { status: 'running', modelLoadProgress: undefined, modelLoadStatus: undefined });
      }

      const messages = [
        { role: 'system' as const, content: agent.systemPrompt },
        ...agent.chatHistory
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ];

      let fullResponse = '';
      const response = await llmEngine.chat(messages, (token) => {
        fullResponse += token;
        set((state2) => ({
          agents: state2.agents.map((a) => {
            if (a.id !== agentId || a.chatHistory.length === 0) return a;
            const updated = [...a.chatHistory];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullResponse };
            return { ...a, chatHistory: updated };
          }),
        }));
      });

      state.updateLastChatMessage(agentId, response || fullResponse);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred';

      let userFriendlyMsg = errorMsg;
      if (errorMsg.includes('WebGPU')) {
        userFriendlyMsg = 'WebGPU is not available in this browser. AI models require a browser with WebGPU support (Chrome 113+, Edge 113+). The AI features are designed for the desktop Electron app or a WebGPU-capable browser.';
      } else if (errorMsg.includes('model')) {
        userFriendlyMsg = `Failed to load the AI model: ${errorMsg}. Try a smaller model or check your available memory.`;
      }

      state.updateLastChatMessage(agentId, `I'm unable to respond right now. ${userFriendlyMsg}`);
      state.updateAgent(agentId, { status: 'error' });
      state.addLog(agentId, 'error', userFriendlyMsg);
    }
  },
}));
