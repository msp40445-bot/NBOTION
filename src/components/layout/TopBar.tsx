import { useAppStore } from '@/stores/appStore';
import { PanelLeft, Moon, Sun } from 'lucide-react';

export function TopBar() {
  const { toggleSidebar, theme, setTheme, currentModule } = useAppStore();

  const moduleNames: Record<string, string> = {
    workspace: 'Workspace',
    messaging: 'Messages',
    projects: 'Projects',
    planner: 'Planner & Goals',
    calendar: 'Calendar',
    health: 'Health & Data',
    integrations: 'Integrations',
    'ai-agents': 'AI Agents',
    settings: 'Settings',
  };

  return (
    <div className="h-12 border-b border-border flex items-center px-4 gap-3 bg-background/80 backdrop-blur-sm"
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <PanelLeft size={18} />
      </button>
      <span className="text-sm font-medium">{moduleNames[currentModule] || 'NBOTION'}</span>
      <div className="ml-auto flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
