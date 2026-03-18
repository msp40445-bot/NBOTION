import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { WorkspaceView } from '@/components/workspace/WorkspaceView';
import { MessagingView } from '@/components/messaging/MessagingView';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { PlannerView } from '@/components/planner/PlannerView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { HealthView } from '@/components/health/HealthView';
import { IntegrationsView } from '@/components/integrations/IntegrationsView';
import { AIAgentsView } from '@/components/ai/AIAgentsView';
import { SettingsView } from '@/components/layout/SettingsView';
import { GrowthView } from '@/components/growth/GrowthView';
import { LockScreen } from '@/components/layout/LockScreen';
import { useAppStore } from '@/stores/appStore';

function App() {
  const { currentModule, sidebarOpen, isLocked } = useAppStore();

  if (isLocked) {
    return <LockScreen />;
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'workspace': return <WorkspaceView />;
      case 'messaging': return <MessagingView />;
      case 'projects': return <ProjectsView />;
      case 'planner': return <PlannerView />;
      case 'calendar': return <CalendarView />;
      case 'health': return <HealthView />;
      case 'integrations': return <IntegrationsView />;
      case 'ai-agents': return <AIAgentsView />;
      case 'growth': return <GrowthView />;
      case 'settings': return <SettingsView />;
      default: return <WorkspaceView />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default App;
