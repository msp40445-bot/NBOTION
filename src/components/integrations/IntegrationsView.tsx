import { useState } from 'react';
import { useHealthStore } from '@/stores/healthStore';
import { cn } from '@/lib/utils';
import {
  Plug, Wifi, WifiOff, MessageSquare, Github, Calendar,
  Radio, Hash, Activity, ChevronDown, ChevronUp, Settings, Info
} from 'lucide-react';

const integrationMeta: Record<string, {
  icon: React.ReactNode; description: string; category: string;
  configFields: { key: string; label: string; placeholder: string; type?: string }[];
}> = {
  telegram: {
    icon: <MessageSquare size={24} className="text-blue-500" />,
    description: 'Send and receive Telegram messages directly in NBOTION',
    category: 'Communication',
    configFields: [
      { key: 'botToken', label: 'Bot Token', placeholder: 'Enter your Telegram bot token' },
      { key: 'chatId', label: 'Chat ID', placeholder: 'Your Telegram chat ID' },
    ],
  },
  discord: {
    icon: <Hash size={24} className="text-indigo-500" />,
    description: 'Connect Discord servers and channels for unified messaging',
    category: 'Communication',
    configFields: [
      { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'Discord webhook URL' },
      { key: 'serverId', label: 'Server ID', placeholder: 'Discord server ID' },
    ],
  },
  github: {
    icon: <Github size={24} />,
    description: 'Access repositories, create PRs, and manage issues with AI agents',
    category: 'Development',
    configFields: [
      { key: 'token', label: 'Personal Access Token', placeholder: 'ghp_...', type: 'password' },
      { key: 'username', label: 'Username', placeholder: 'Your GitHub username' },
    ],
  },
  whoop: {
    icon: <Activity size={24} className="text-green-500" />,
    description: 'Sync health metrics like HRV, recovery, sleep, and strain',
    category: 'Health',
    configFields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'Whoop API client ID' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'Whoop API secret', type: 'password' },
    ],
  },
  'google-calendar': {
    icon: <Calendar size={24} className="text-blue-500" />,
    description: 'Sync your Google Calendar events and reminders',
    category: 'Productivity',
    configFields: [
      { key: 'calendarId', label: 'Calendar ID', placeholder: 'primary' },
    ],
  },
  slack: {
    icon: <Radio size={24} className="text-purple-500" />,
    description: 'Integrate Slack workspaces for team communication',
    category: 'Communication',
    configFields: [
      { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'Slack webhook URL' },
      { key: 'workspace', label: 'Workspace', placeholder: 'Your Slack workspace name' },
    ],
  },
};

export function IntegrationsView() {
  const { integrations, updateIntegration } = useHealthStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, Record<string, string>>>({});

  const handleSaveConfig = (integrationId: string) => {
    const values = configValues[integrationId] || {};
    updateIntegration(integrationId, { config: values });
  };

  const categories = [...new Set(integrations.map((i) => integrationMeta[i.type]?.category || 'Other'))];

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug size={24} className="text-primary" />
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Connect your favorite apps and services</p>
      </div>

      <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">All integrations run locally</p>
          <p className="text-xs text-muted-foreground">Your API keys and tokens are encrypted with AES-256-GCM and never leave your device.</p>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h2>
          <div className="space-y-3">
            {integrations
              .filter((i) => (integrationMeta[i.type]?.category || 'Other') === category)
              .map((integration) => {
                const meta = integrationMeta[integration.type];
                const isExpanded = expandedId === integration.id;
                const localConfig = configValues[integration.id] || integration.config || {};
                return (
                  <div key={integration.id} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        {meta?.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{meta?.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {integration.status === 'connected' && (
                          <span className="flex items-center gap-1.5 text-xs text-green-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Connected
                          </span>
                        )}
                        {integration.status === 'error' && (
                          <span className="flex items-center gap-1.5 text-xs text-destructive">
                            <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                            Error
                          </span>
                        )}
                        <button
                          onClick={() => updateIntegration(integration.id, {
                            status: integration.status === 'connected' ? 'disconnected' : 'connected'
                          })}
                          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            integration.status === 'connected'
                              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          )}
                        >
                          {integration.status === 'connected' ? <><WifiOff size={14} /> Disconnect</> : <><Wifi size={14} /> Connect</>}
                        </button>
                        <button onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && meta && (
                      <div className="px-5 pb-5 pt-0 border-t border-border mt-0 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Settings size={14} className="text-muted-foreground" />
                          <span className="text-sm font-medium">Configuration</span>
                        </div>
                        <div className="space-y-3">
                          {meta.configFields.map((field) => (
                            <div key={field.key}>
                              <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                              <input
                                type={field.type || 'text'}
                                value={localConfig[field.key] || ''}
                                onChange={(e) => setConfigValues((prev) => ({
                                  ...prev,
                                  [integration.id]: { ...(prev[integration.id] || {}), [field.key]: e.target.value },
                                }))}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        <button onClick={() => handleSaveConfig(integration.id)}
                          className="mt-3 px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                          Save Configuration
                        </button>
                        {integration.lastSync && (
                          <p className="text-xs text-muted-foreground mt-3">Last synced: {new Date(integration.lastSync).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
