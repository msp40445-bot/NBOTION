import { useAppStore } from '@/stores/appStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { cn } from '@/lib/utils';
import {
  FileText, MessageSquare, LayoutDashboard, Target, Calendar,
  Heart, Plug, Bot, Settings, Plus, ChevronRight, Search,
  Lock, Database, TrendingUp, StickyNote
} from 'lucide-react';
import { AppModule } from '@/types';

const modules: { id: AppModule; label: string; icon: React.ElementType }[] = [
  { id: 'workspace', label: 'Notes', icon: StickyNote },
  { id: 'messaging', label: 'Messages', icon: MessageSquare },
  { id: 'projects', label: 'Projects', icon: LayoutDashboard },
  { id: 'planner', label: 'Planner & Goals', icon: Target },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'health', label: 'Health & Data', icon: Heart },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'ai-agents', label: 'AI Agents', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { currentModule, setCurrentModule, lock } = useAppStore();
  const { pages, currentPageId, setCurrentPage, addPage, addDatabase } = useWorkspaceStore();

  const rootPages = pages.filter((p) => !p.parentId);

  return (
    <div className="w-64 h-full bg-sidebar border-r border-border flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        <span className="font-semibold text-sidebar-foreground">NBOTION</span>
        <button onClick={lock} className="ml-auto p-1 rounded hover:bg-sidebar-hover text-muted-foreground" title="Lock app">
          <Lock size={14} />
        </button>
      </div>

      <div className="px-3 mb-2">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sidebar-hover">
          <Search size={14} />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>

      <nav className="px-2 space-y-0.5">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setCurrentModule(mod.id)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
              currentModule === mod.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-hover'
            )}
          >
            <mod.icon size={16} />
            <span>{mod.label}</span>
          </button>
        ))}
      </nav>

      {currentModule === 'workspace' && (
        <div className="flex-1 mt-4 px-2 overflow-auto">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pages</span>
            <div className="flex gap-1">
              <button onClick={() => addPage()} className="p-0.5 rounded hover:bg-sidebar-hover text-muted-foreground" title="New page">
                <Plus size={14} />
              </button>
              <button onClick={() => addDatabase()} className="p-0.5 rounded hover:bg-sidebar-hover text-muted-foreground" title="New database">
                <Database size={14} />
              </button>
            </div>
          </div>
          <div className="space-y-0.5">
            {rootPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                className={cn(
                  'w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors group',
                  currentPageId === page.id
                    ? 'bg-sidebar-hover text-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-hover'
                )}
              >
                {page.children.length > 0 && <ChevronRight size={12} className="text-muted-foreground" />}
                <span className="text-base">{page.icon || (page.isDatabase ? '📊' : '📄')}</span>
                <span className="truncate">{page.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">U</span>
          </div>
          <span className="text-sm text-sidebar-foreground">User</span>
        </div>
      </div>
    </div>
  );
}
