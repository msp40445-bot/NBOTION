import { useState, useRef, useEffect } from 'react';
import { useAIStore } from '@/stores/aiStore';
import { cn } from '@/lib/utils';
import { AIModelId, AgentCapability } from '@/types';
import { MODEL_CATALOG, getModelInfo } from '@/lib/webllm';
import {
  Bot, Plus, Square, Trash2, Cpu,
  Terminal, Code, FileText, MessageSquare, LayoutDashboard, Github, Calendar,
  Target, Heart, Eye, Send, Loader2, Download, RotateCcw, Sparkles
} from 'lucide-react';

const capabilityLabels: Record<AgentCapability, { label: string; icon: React.ElementType }> = {
  'read-pages': { label: 'Read Pages', icon: FileText },
  'write-pages': { label: 'Write Pages', icon: FileText },
  'read-messages': { label: 'Read Messages', icon: MessageSquare },
  'send-messages': { label: 'Send Messages', icon: MessageSquare },
  'manage-issues': { label: 'Manage Issues', icon: LayoutDashboard },
  'github-access': { label: 'GitHub Access', icon: Github },
  'create-pr': { label: 'Create PRs', icon: Code },
  'debug-app': { label: 'Debug App', icon: Terminal },
  'dom-access': { label: 'DOM Access', icon: Eye },
  'read-calendar': { label: 'Read Calendar', icon: Calendar },
  'manage-goals': { label: 'Manage Goals', icon: Target },
  'health-data': { label: 'Health Data', icon: Heart },
};

export function AIAgentsView() {
  const {
    agents, currentAgentId, setCurrentAgent, addAgent, deleteAgent,
    stopAgent, sendMessage, clearChat
  } = useAIStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '', model: 'qwen-2.5-3b' as AIModelId,
    systemPrompt: '', capabilities: [] as AgentCapability[]
  });
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentAgent = agents.find((a) => a.id === currentAgentId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentAgent?.chatHistory]);

  const handleCreate = () => {
    if (newAgent.name.trim()) {
      const agent = addAgent(newAgent.name, newAgent.model,
        newAgent.systemPrompt || 'You are a helpful assistant. Be concise, practical, and honest about your limitations.',
        newAgent.capabilities);
      setCurrentAgent(agent.id);
      setNewAgent({ name: '', model: 'qwen-2.5-3b', systemPrompt: '', capabilities: [] });
      setShowCreate(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !currentAgent || isSending) return;
    const msg = chatInput.trim();
    setChatInput('');
    setIsSending(true);
    try {
      await sendMessage(currentAgent.id, msg);
    } finally {
      setIsSending(false);
    }
  };

  const toggleCapability = (cap: AgentCapability) => {
    setNewAgent((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter((c) => c !== cap)
        : [...prev.capabilities, cap]
    }));
  };

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-border flex flex-col bg-card/50">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2"><Bot size={18} /> AI Agents</h2>
            <button onClick={() => setShowCreate(true)} className="p-1 rounded hover:bg-muted text-muted-foreground"><Plus size={16} /></button>
          </div>
          <p className="text-xs text-muted-foreground">Build and run local AI agents powered by offline models</p>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {agents.map((agent) => {
            const modelInfo = getModelInfo(agent.model);
            return (
              <button key={agent.id} onClick={() => setCurrentAgent(agent.id)}
                className={cn('w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  currentAgentId === agent.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted')}>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                  agent.status === 'running' ? 'bg-green-500/20' : agent.status === 'loading' ? 'bg-yellow-500/20' :
                  agent.status === 'error' ? 'bg-red-500/20' : 'bg-muted')}>
                  {agent.status === 'loading' ? <Loader2 size={16} className="text-yellow-500 animate-spin" /> :
                   <Bot size={16} className={agent.status === 'running' ? 'text-green-500' : agent.status === 'error' ? 'text-red-500' : 'text-muted-foreground'} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{agent.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Cpu size={10} />
                    {modelInfo.label.split(' ').slice(-2).join(' ')}
                    {agent.status === 'running' && <span className="ml-1 flex items-center gap-1 text-green-500"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Active</span>}
                    {agent.status === 'loading' && <span className="ml-1 text-yellow-500">Loading...</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {showCreate ? (
          <div className="p-6 max-w-2xl mx-auto w-full overflow-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Sparkles size={20} className="text-primary" /> Create New Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Agent Name</label>
                <input value={newAgent.name} onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="e.g. Research Assistant" className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Model (runs locally, no API needed)</label>
                <div className="grid grid-cols-1 gap-3">
                  {MODEL_CATALOG.map((m) => (
                    <button key={m.id} onClick={() => setNewAgent({ ...newAgent, model: m.id })}
                      className={cn('p-3 rounded-lg border text-left text-sm', newAgent.model === m.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted')}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{m.label}</div>
                        <span className="text-xs text-muted-foreground">{m.size}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.description}</div>
                      <div className="flex gap-1 mt-1.5">
                        {m.strengths.map((s) => (<span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded">{s}</span>))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">System Prompt</label>
                <textarea value={newAgent.systemPrompt} onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  placeholder="You are a helpful assistant..." rows={3}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Capabilities</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(capabilityLabels) as AgentCapability[]).map((cap) => {
                    const config = capabilityLabels[cap];
                    return (
                      <button key={cap} onClick={() => toggleCapability(cap)}
                        className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
                          newAgent.capabilities.includes(cap) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted')}>
                        <config.icon size={12} />{config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                <button onClick={handleCreate} disabled={!newAgent.name.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50">Create Agent</button>
              </div>
            </div>
          </div>
        ) : currentAgent ? (
          <>
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <Bot size={20} className={currentAgent.status === 'running' ? 'text-green-500' : currentAgent.status === 'loading' ? 'text-yellow-500' : currentAgent.status === 'error' ? 'text-red-500' : 'text-muted-foreground'} />
              <div className="flex-1">
                <h2 className="font-semibold">{currentAgent.name}</h2>
                <p className="text-xs text-muted-foreground">{currentAgent.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Cpu size={12} />{getModelInfo(currentAgent.model).label}</span>
                {currentAgent.status === 'loading' && currentAgent.modelLoadProgress !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${currentAgent.modelLoadProgress * 100}%` }} />
                    </div>
                    <span className="text-xs text-yellow-500">{Math.round(currentAgent.modelLoadProgress * 100)}%</span>
                  </div>
                )}
                {currentAgent.status === 'running' && (
                  <button onClick={() => stopAgent(currentAgent.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-sm"><Square size={14} /> Stop</button>
                )}
                <button onClick={() => clearChat(currentAgent.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Clear chat"><RotateCcw size={16} /></button>
                <button onClick={() => deleteAgent(currentAgent.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Delete agent"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {currentAgent.chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Bot size={48} className="mb-3 opacity-30" />
                    <p className="text-sm font-medium">Chat with {currentAgent.name}</p>
                    <p className="text-xs mt-1 text-center max-w-md">Powered by {getModelInfo(currentAgent.model).label} running locally in your browser via WebGPU. No data leaves your device.</p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-lg">
                      {getModelInfo(currentAgent.model).strengths.map((s) => (<span key={s} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{s}</span>))}
                    </div>
                    {currentAgent.capabilities.length > 0 && (
                      <p className="text-xs mt-3 text-muted-foreground">Capabilities: {currentAgent.capabilities.map((c) => capabilityLabels[c].label).join(', ')}</p>
                    )}
                  </div>
                ) : (
                  currentAgent.chatHistory.map((msg) => (
                    <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-primary" /></div>
                      )}
                      <div className={cn('max-w-[75%] rounded-lg px-4 py-2.5', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content || (msg.isStreaming ? '...' : '')}</p>
                        {msg.isStreaming && <div className="flex items-center gap-1 mt-1"><Loader2 size={12} className="animate-spin text-muted-foreground" /><span className="text-xs text-muted-foreground">Generating...</span></div>}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0"><span className="text-xs font-medium text-primary">You</span></div>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              {currentAgent.status === 'loading' && currentAgent.modelLoadStatus && (
                <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20">
                  <div className="flex items-center gap-2 text-xs text-yellow-600"><Download size={12} /><span className="truncate">{currentAgent.modelLoadStatus}</span></div>
                </div>
              )}
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); }}}
                    placeholder={isSending ? 'Waiting for response...' : `Message ${currentAgent.name}...`}
                    disabled={isSending} className="flex-1 bg-transparent border-none outline-none text-sm disabled:opacity-50" />
                  <button onClick={handleChat} disabled={isSending || !chatInput.trim()}
                    className="p-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-50 hover:bg-primary/90">
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  Model runs locally via WebGPU. First message downloads the model (~{getModelInfo(currentAgent.model).size}).
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Bot size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Select an agent or create a new one</p>
              <p className="text-xs mt-1 max-w-sm mx-auto">AI agents run entirely offline using WebGPU. Choose from Qwen, Llama, Phi, Gemma, or DeepSeek models.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
