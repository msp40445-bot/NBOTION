import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { cn, statusColors, priorityColors } from '@/lib/utils';
import { IssueStatus, IssuePriority } from '@/types';
import {
  LayoutDashboard, List, GanttChart, Plus, MoreHorizontal,
  AlertCircle, ArrowUp, ArrowDown, Minus, Circle, ChevronRight
} from 'lucide-react';

const statusLabels: Record<IssueStatus, string> = {
  backlog: 'Backlog', todo: 'To Do', 'in-progress': 'In Progress',
  'in-review': 'In Review', done: 'Done', cancelled: 'Cancelled',
};

const priorityIcons: Record<IssuePriority, React.ReactNode> = {
  urgent: <AlertCircle size={14} className="text-red-500" />,
  high: <ArrowUp size={14} className="text-orange-500" />,
  medium: <Minus size={14} className="text-yellow-500" />,
  low: <ArrowDown size={14} className="text-blue-500" />,
  none: <Circle size={14} className="text-gray-500" />,
};

export function ProjectsView() {
  const {
    projects, currentProjectId, currentView, setCurrentProject, setCurrentView,
    addIssue, moveIssue, getIssuesByStatus, updateIssue, deleteIssue
  } = useProjectStore();
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [addingToStatus, setAddingToStatus] = useState<IssueStatus | null>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const issuesByStatus = currentProjectId ? getIssuesByStatus(currentProjectId) : {} as Record<IssueStatus, never[]>;

  const handleAddIssue = (status: IssueStatus) => {
    if (newIssueTitle.trim() && currentProjectId) {
      addIssue(currentProjectId, newIssueTitle.trim(), status);
      setNewIssueTitle('');
      setAddingToStatus(null);
    }
  };

  const statuses: IssueStatus[] = ['backlog', 'todo', 'in-progress', 'in-review', 'done'];

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3 border-b border-border flex items-center gap-4">
        <div className="flex gap-1">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setCurrentProject(p.id)}
              className={cn('px-3 py-1.5 rounded-md text-sm', currentProjectId === p.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted')}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 bg-muted rounded-md p-0.5">
          <button onClick={() => setCurrentView('board')} className={cn('px-2 py-1 rounded text-xs', currentView === 'board' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            <LayoutDashboard size={14} />
          </button>
          <button onClick={() => setCurrentView('list')} className={cn('px-2 py-1 rounded text-xs', currentView === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            <List size={14} />
          </button>
        </div>
      </div>

      {currentView === 'board' ? (
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full min-w-max">
            {statuses.map((status) => (
              <div key={status} className="w-72 flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={cn('w-2.5 h-2.5 rounded-full', statusColors[status])} />
                  <span className="text-sm font-medium">{statusLabels[status]}</span>
                  <span className="text-xs text-muted-foreground ml-1">{issuesByStatus[status]?.length || 0}</span>
                  <button onClick={() => setAddingToStatus(status)} className="ml-auto p-0.5 rounded hover:bg-muted text-muted-foreground">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex-1 space-y-2 overflow-auto">
                  {addingToStatus === status && (
                    <div className="bg-card border border-border rounded-lg p-3">
                      <input value={newIssueTitle} onChange={(e) => setNewIssueTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddIssue(status); if (e.key === 'Escape') setAddingToStatus(null); }}
                        placeholder="Issue title..." className="w-full bg-transparent text-sm outline-none" autoFocus
                      />
                    </div>
                  )}
                  {(issuesByStatus[status] || []).map((issue) => (
                    <div key={issue.id} className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 cursor-pointer group">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground font-mono mt-0.5">{issue.key}</span>
                        <p className="text-sm flex-1">{issue.title}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {priorityIcons[issue.priority]}
                        {issue.labels.map((l) => (
                          <span key={l} className="text-xs bg-muted px-1.5 py-0.5 rounded">{l}</span>
                        ))}
                        {issue.assigneeName && (
                          <span className="ml-auto text-xs text-muted-foreground">{issue.assigneeName}</span>
                        )}
                      </div>
                      <div className="hidden group-hover:flex gap-1 mt-2 pt-2 border-t border-border">
                        {statuses.filter((s) => s !== status).map((s) => (
                          <button key={s} onClick={() => moveIssue(issue.id, s)}
                            className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground">
                            {statusLabels[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Key</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Title</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Priority</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Labels</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(issuesByStatus).flat().map((issue) => (
                <tr key={issue.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-muted-foreground">{issue.key}</td>
                  <td className="px-3 py-2">{issue.title}</td>
                  <td className="px-3 py-2">
                    <span className={cn('inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full', `${statusColors[issue.status]}/20`)}>
                      <div className={cn('w-1.5 h-1.5 rounded-full', statusColors[issue.status])} />
                      {statusLabels[issue.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">{priorityIcons[issue.priority]}</td>
                  <td className="px-3 py-2">
                    {issue.labels.map((l) => (
                      <span key={l} className="text-xs bg-muted px-1.5 py-0.5 rounded mr-1">{l}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
