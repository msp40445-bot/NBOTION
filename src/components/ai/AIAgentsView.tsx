import { useState } from 'react';
import { useAIStore } from '@/stores/aiStore';
import { cn, formatRelativeTime } from '@/lib/utils';
import { AIAgent, AgentCapability } from '@/types';
import {
  Bot, Plus, Play, Square, Trash2, Settings, Brain, Cpu,
  ChevronRight, Terminal, AlertCircle, Info, Zap, Code,
  FileText, MessageSquare, LayoutDashboard, Github, Calendar,
  Target, Heart, Eye
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
    updateAgent, runAgent, stopAgent, addLog, clearLogs
  } = useAIStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '', model: 'qwen-2.5-3b' as AIAgent['model'],
    systemPrompt: '', capabilities: [] as AgentCapability[]
  });
  const [chatInput, setChatInput] = useState('');

  const currentAgent = agents.find((a) => a.id === currentAgentId);

  const handleCreate = () => {
    if (newAgent.name.trim()) {
      const agent = addAgent(newAgent.name, newAgent.model, newAgent.systemPrompt || 'You are a helpful assistant.', newAgent.capabilities);
      setCurrentAgent(agent.id);
      setNewAgent({ name: '', model: 'qwen-2.5-3b', systemPrompt: '', capabilities: [] });
      setShowCreate(false);
    }
  };

  const handleChat = () => {
    if (chatInput.trim() && currentAgent) {
      addLog(currentAgent.id, 'info', `User: ${chatInput}`);
      addLog(currentAgent.id, 'thought', 'Processing request...');
      setTimeout(() => {
        addLog(currentAgent.id, 'action', `Agent (${currentAgent.model}): I understand your request. Let me help you with that. [Running locally on ${currentAgent.model === 'qwen-2.5-3b' ? 'Qwen 2.5 3B Instruct' : currentAgent.model === 'qwen-2.5-7b' ? 'Qwen 2.5 7B Instruct (Q4)' : 'Custom Model'}]`);
      }, 500);
      setChatInput('');
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
      {/* Agent list */}
      <div className="w-72 border-r border-border flex flex-col bg-card/50">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2"><Bot size={18} /> AI Agents</h2>
            <button onClick={() => setShowCreate(true)} className="p-1 rounded hover:bg-muted text-muted-foreground"><Plus size={16} /></button>
          </div>
          <p className="text-xs text-muted-foreground">Build and run local AI agents with Qwen models</p>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setCurrentAgent(agent.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                currentAgentId === agent.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
              )}
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                agent.status === 'running' ? 'bg-green-500/20' : 'bg-muted'
              )}>
                <Bot size={16} className={agent.status === 'running' ? 'text-green-500' : 'text-muted-foreground'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{agent.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Cpu size={10} />
                  {agent.model === 'qwen-2.5-3b' ? '3B' : agent.model === 'qwen-2.5-7b' ? '7B' : 'Custom'}
                  {agent.status === 'running' && (
                    <span className="ml-1 flex items-center gap-1 text-green-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Running
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Agent detail */}
      <div className="flex-1 flex flex-col">
        {showCreate ? (
          <div className="p-6 max-w-2xl mx-auto w-full">
            <h2 className="text-xl font-bold mb-4">Create New Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Agent Name</label>
                <input value={newAgent.name} onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="My Agent" className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Model</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'qwen-2.5-3b', label: 'Qwen 2.5 3B', desc: 'Fast, runs on 8GB RAM' },
                    { id: 'qwen-2.5-7b', label: 'Qwen 2.5 7B Q4', desc: 'Better quality, quantized' },
                    { id: 'custom', label: 'Custom', desc: 'Bring your own model' },
                  ].map((m) => (
                    <button key={m.id} onClick={() => setNewAgent({ ...newAgent, model: m.id as AIAgent['model'] })}
                      className={cn('p-3 rounded-lg border text-left text-sm', newAgent.model === m.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted')}>
                      <div className="font-medium">{m.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
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
                          newAgent.capabilities.includes(cap) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                        )}>
                        <config.icon size={12} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Create Agent</button>
              </div>
            </div>
          </div>
        ) : currentAgent ? (
          <>
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <Bot size={20} className={currentAgent.status === 'running' ? 'text-green-500' : 'text-muted-foreground'} />
              <div>
                <h2 className="font-semibold">{currentAgent.name}</h2>
                <p className="text-xs text-muted-foreground">{currentAgent.description}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Cpu size={12} />
                  {currentAgent.model === 'qwen-2.5-3b' ? 'Qwen 2.5 3B Instruct' : currentAgent.model === 'qwen-2.5-7b' ? 'Qwen 2.5 7B Q4' : 'Custom'}
                </span>
                {currentAgent.status === 'running' ? (
                  <button onClick={() => stopAgent(currentAgent.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-sm">
                    <Square size={14} /> Stop
                  </button>
                ) : (
                  <button onClick={() => { runAgent(currentAgent.id); addLog(currentAgent.id, 'info', 'Agent started'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-md text-sm">
                    <Play size={14} /> Run
                  </button>
                )}
                <button onClick={() => deleteAgent(currentAgent.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {currentAgent.logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Brain size={48} className="mb-3 opacity-30" />
                    <p className="text-sm">Start the agent or send a message</p>
                    <p className="text-xs mt-1">Capabilities: {currentAgent.capabilities.map((c) => capabilityLabels[c].label).join(', ')}</p>
                  </div>
                ) : (
                  currentAgent.logs.map((log) => (
                    <div key={log.id} className={cn('flex items-start gap-2 text-sm p-2 rounded',
                      log.type === 'error' ? 'bg-destructive/10 text-destructive' :
                      log.type === 'thought' ? 'bg-yellow-500/10 text-yellow-600' :
                      log.type === 'action' ? 'bg-primary/10 text-primary' :
                      'bg-muted/50'
                    )}>
                      {log.type === 'error' ? <AlertCircle size={14} className="mt-0.5 flex-shrink-0" /> :
                       log.type === 'thought' ? <Brain size={14} className="mt-0.5 flex-shrink-0" /> :
                       log.type === 'action' ? <Zap size={14} className="mt-0.5 flex-shrink-0" /> :
                       <Info size={14} className="mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{log.message}</p>
                        <span className="text-xs opacity-60">{formatRelativeTime(log.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder={`Message ${currentAgent.name}...`}
                    className="flex-1 bg-transparent border-none outline-none text-sm" />
                  <button onClick={handleChat} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">Send</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Bot size={48} className="mx-auto mb-3 opacity-30" />
              <p>Select an agent or create a new one</p>
              <p className="text-xs mt-1">Build AI agents powered by local Qwen models</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
