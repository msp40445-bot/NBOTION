import { create } from 'zustand';
import { AIAgent, AgentCapability, AgentLog } from '@/types';
import { generateId } from '@/lib/utils';

interface AIState {
  agents: AIAgent[];
  currentAgentId: string | null;
  addAgent: (name: string, model: AIAgent['model'], systemPrompt: string, capabilities: AgentCapability[]) => AIAgent;
  updateAgent: (id: string, updates: Partial<AIAgent>) => void;
  deleteAgent: (id: string) => void;
  setCurrentAgent: (id: string | null) => void;
  addLog: (agentId: string, type: AgentLog['type'], message: string) => void;
  clearLogs: (agentId: string) => void;
  runAgent: (id: string) => void;
  stopAgent: (id: string) => void;
}

export const useAIStore = create<AIState>((set) => ({
  agents: [
    {
      id: 'agent-1', name: 'Code Assistant',
      description: 'Helps with code review, debugging, and improvements',
      model: 'qwen-2.5-7b',
      systemPrompt: 'You are a helpful code assistant. You can read and write pages, manage issues, and access GitHub repositories.',
      capabilities: ['read-pages', 'write-pages', 'manage-issues', 'github-access', 'create-pr', 'debug-app'],
      status: 'idle', createdAt: new Date().toISOString(), logs: [],
    },
    {
      id: 'agent-2', name: 'Daily Planner',
      description: 'Helps plan your day, set goals, and track progress',
      model: 'qwen-2.5-3b',
      systemPrompt: 'You are a productivity assistant. Help the user plan their day, set and track goals, manage their calendar.',
      capabilities: ['read-pages', 'read-calendar', 'manage-goals', 'health-data'],
      status: 'idle', createdAt: new Date().toISOString(), logs: [],
    },
  ],
  currentAgentId: null,
  addAgent: (name, model, systemPrompt, capabilities) => {
    const agent: AIAgent = {
      id: generateId(), name, model, systemPrompt, capabilities,
      status: 'idle', createdAt: new Date().toISOString(), logs: [],
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
    set((state) => ({
      agents: state.agents.map((a) => a.id === id ? { ...a, status: 'idle' as const } : a),
    }));
  },
}));
