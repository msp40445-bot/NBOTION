import { useAppStore } from '@/stores/appStore';
import { Shield, Palette, Info } from 'lucide-react';

export function SettingsView() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
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

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <Info size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">About</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            NBOTION v1.0.0 - The Ultimate All-in-One Desktop App
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Workspace, Messaging, Projects, Planner, Calendar, Health, Integrations, AI Agents
          </p>
        </div>
      </div>
    </div>
  );
}
