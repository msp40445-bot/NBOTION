import { useHealthStore } from '@/stores/healthStore';
import { cn } from '@/lib/utils';
import {
  Plug, Wifi, WifiOff, MessageSquare, Github, Calendar,
  Radio, Hash, Activity, ExternalLink
} from 'lucide-react';

const integrationIcons: Record<string, React.ReactNode> = {
  telegram: <MessageSquare size={24} className="text-blue-500" />,
  discord: <Hash size={24} className="text-indigo-500" />,
  github: <Github size={24} />,
  whoop: <Activity size={24} className="text-green-500" />,
  'google-calendar': <Calendar size={24} className="text-blue-500" />,
  slack: <Radio size={24} className="text-purple-500" />,
};

const integrationDescriptions: Record<string, string> = {
  telegram: 'Send and receive Telegram messages directly in NBOTION',
  discord: 'Connect Discord servers and channels for unified messaging',
  github: 'Access repositories, create PRs, and manage issues with AI agents',
  whoop: 'Sync health metrics like HRV, recovery, sleep, and strain',
  'google-calendar': 'Sync your Google Calendar events and reminders',
  slack: 'Integrate Slack workspaces for team communication',
};

export function IntegrationsView() {
  const { integrations, updateIntegration } = useHealthStore();

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug size={24} className="text-primary" />
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Connect your favorite apps and services</p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                {integrationIcons[integration.type]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integrationDescriptions[integration.type]}</p>
              </div>
              <div className="flex items-center gap-3">
                {integration.status === 'connected' && (
                  <span className="flex items-center gap-1.5 text-xs text-green-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Connected
                  </span>
                )}
                <button
                  onClick={() => updateIntegration(integration.id, {
                    status: integration.status === 'connected' ? 'disconnected' : 'connected'
                  })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    integration.status === 'connected'
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {integration.status === 'connected' ? (
                    <><WifiOff size={14} /> Disconnect</>
                  ) : (
                    <><Wifi size={14} /> Connect</>
                  )}
                </button>
              </div>
            </div>
            {integration.lastSync && (
              <p className="text-xs text-muted-foreground mt-3">Last synced: {new Date(integration.lastSync).toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
