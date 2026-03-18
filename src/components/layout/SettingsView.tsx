import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { MODEL_CATALOG, llmEngine } from '@/lib/webllm';
import { cn } from '@/lib/utils';
import {
  Shield, Palette, Info, User, Bell, Download,
  Cpu, Trash2, HardDrive, Check
} from 'lucide-react';

export function SettingsView() {
  const { theme, setTheme } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'data' | 'about'>('general');
  const [profileName, setProfileName] = useState('User');
  const [notifications, setNotifications] = useState({ goals: true, reminders: true, messages: true });
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        localStorage: { ...localStorage },
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nbotion-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('Data exported successfully!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus('Export failed. Please try again.');
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: User },
    { id: 'ai' as const, label: 'AI Models', icon: Cpu },
    { id: 'data' as const, label: 'Data', icon: HardDrive },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}>
            <tab.icon size={16} />{tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'general' && (
          <>
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <User size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Profile</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Display Name</label>
                  <input value={profileName} onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <Palette size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Appearance</h2>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setTheme('light')}
                  className={cn('flex-1 py-3 rounded-lg border text-sm font-medium transition-colors',
                    theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted')}>
                  Light
                </button>
                <button onClick={() => setTheme('dark')}
                  className={cn('flex-1 py-3 rounded-lg border text-sm font-medium transition-colors',
                    theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted')}>
                  Dark
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <Bell size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>
              <div className="space-y-3">
                {([['goals', 'Goal reminders'], ['reminders', 'Calendar reminders'], ['messages', 'New messages']] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <button onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className={cn('w-10 h-5 rounded-full transition-colors relative',
                        notifications[key] ? 'bg-primary' : 'bg-muted')}>
                      <div className={cn('w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform',
                        notifications[key] ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Security</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                All your data is encrypted with AES-256-GCM encryption. Your encryption key never leaves your device.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-500">Encryption Active</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'ai' && (
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <Cpu size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">AI Models</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              All models run locally in your browser via WebGPU. No data is sent to any server.
            </p>
            <div className="space-y-3">
              {MODEL_CATALOG.map((model) => {
                const isLoaded = llmEngine.getLoadedModel() === model.id;
                return (
                  <div key={model.id} className={cn('p-4 rounded-lg border', isLoaded ? 'border-green-500/30 bg-green-500/5' : 'border-border')}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{model.label}</span>
                        {isLoaded && <span className="text-xs text-green-500 flex items-center gap-1"><Check size={12} /> Loaded</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{model.size}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                    <div className="flex gap-1 mt-2">
                      {model.strengths.map((s) => (
                        <span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Models are downloaded on first use and cached in your browser. Select models when creating AI agents.
            </p>
          </div>
        )}

        {activeTab === 'data' && (
          <>
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <Download size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Export Data</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your data as a JSON file. This includes notes, goals, calendar events, messages, and settings.
              </p>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
                <Download size={16} /> Export All Data
              </button>
              {exportStatus && (
                <p className="text-xs text-green-500 mt-2">{exportStatus}</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 size={20} className="text-destructive" />
                <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Clear all local data. This action cannot be undone. Make sure to export your data first.
              </p>
              <button onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20">
                <Trash2 size={16} /> Clear All Data
              </button>
            </div>
          </>
        )}

        {activeTab === 'about' && (
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <Info size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">About NBOTION</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              NBOTION v1.0.0 - The Ultimate All-in-One Desktop App
            </p>
            <p className="text-xs text-muted-foreground">
              Notes, Messaging, Projects, Planner & Goals, Calendar, Health Tracking, Growth Dashboard, Integrations, AI Agents
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                All data is stored locally with AES-256-GCM encryption. AI models run offline via WebGPU. No data leaves your device.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
