import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { cn, statusColors } from '@/lib/utils';
import { IssueStatus, IssuePriority } from '@/types';
import {
  LayoutDashboard, List, Plus, X,
  AlertCircle, ArrowUp, ArrowDown, Minus, Circle, Trash2
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

const projectColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export function ProjectsView() {
  const {
    projects, currentProjectId, currentView, setCurrentProject, setCurrentView,
    addProject, deleteProject, addIssue, moveIssue, getIssuesByStatus, deleteIssue
  } = useProjectStore();
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [addingToStatus, setAddingToStatus] = useState<IssueStatus | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', key: '', color: '#8B5CF6' });
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const issuesByStatus = currentProjectId ? getIssuesByStatus(currentProjectId) : {} as Record<IssueStatus, never[]>;
  const allIssues = Object.values(issuesByStatus).flat();
  const selectedIssue = allIssues.find((i) => i.id === selectedIssueId);

  const handleAddIssue = (status: IssueStatus) => {
    if (newIssueTitle.trim() && currentProjectId) {
      addIssue(currentProjectId, newIssueTitle.trim(), status);
      setNewIssueTitle('');
      setAddingToStatus(null);
    }
  };

  const handleCreateProject = () => {
    if (newProject.name.trim() && newProject.key.trim()) {
      const p = addProject(newProject.name.trim(), newProject.key.trim().toUpperCase(), newProject.color);
      setCurrentProject(p.id);
      setNewProject({ name: '', key: '', color: '#8B5CF6' });
      setShowNewProject(false);
    }
  };

  const statuses: IssueStatus[] = ['backlog', 'todo', 'in-progress', 'in-review', 'done'];

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3 border-b border-border flex items-center gap-4">
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setCurrentProject(p.id)}
              className={cn('px-3 py-1.5 rounded-md text-sm whitespace-nowrap flex items-center gap-2',
                currentProjectId === p.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted')}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </button>
          ))}
          <button onClick={() => setShowNewProject(true)}
            className="px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted flex items-center gap-1">
            <Plus size={14} /> New
          </button>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
          <button onClick={() => setCurrentView('board')} className={cn('px-2 py-1 rounded text-xs', currentView === 'board' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            <LayoutDashboard size={14} />
          </button>
          <button onClick={() => setCurrentView('list')} className={cn('px-2 py-1 rounded text-xs', currentView === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            <List size={14} />
          </button>
        </div>
      </div>

      {/* New Project Dialog */}
      {showNewProject && (
        <div className="px-6 py-3 border-b border-border bg-card animate-fade-in">
          <h3 className="text-sm font-semibold mb-3">Create New Project</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Project Name</label>
              <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="My Project" className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm" autoFocus />
            </div>
            <div className="w-24">
              <label className="text-xs text-muted-foreground mb-1 block">Key</label>
              <input value={newProject.key} onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase().slice(0, 4) })}
                placeholder="MP" className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm" maxLength={4} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Color</label>
              <div className="flex gap-1">
                {projectColors.map((c) => (
                  <button key={c} onClick={() => setNewProject({ ...newProject, color: c })}
                    className={cn('w-7 h-7 rounded-full', newProject.color === c && 'ring-2 ring-offset-2 ring-primary')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={() => setShowNewProject(false)} className="px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
            <button onClick={handleCreateProject} disabled={!newProject.name.trim() || !newProject.key.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">Create</button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {currentView === 'board' ? (
            <div className="p-4">
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
                            placeholder="Issue title..." className="w-full bg-transparent text-sm outline-none" autoFocus />
                        </div>
                      )}
                      {(issuesByStatus[status] || []).map((issue) => (
                        <div key={issue.id} onClick={() => setSelectedIssueId(issue.id)}
                          className={cn('bg-card border rounded-lg p-3 hover:border-primary/30 cursor-pointer group',
                            selectedIssueId === issue.id ? 'border-primary' : 'border-border')}>
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
                              <button key={s} onClick={(e) => { e.stopPropagation(); moveIssue(issue.id, s); }}
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
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Key</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Title</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Priority</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Labels</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {allIssues.map((issue) => (
                    <tr key={issue.id} onClick={() => setSelectedIssueId(issue.id)}
                      className={cn('border-b border-border cursor-pointer',
                        selectedIssueId === issue.id ? 'bg-primary/5' : 'hover:bg-muted/30')}>
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
                      <td className="px-3 py-2">
                        <button onClick={(e) => { e.stopPropagation(); deleteIssue(issue.id); }}
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Issue detail panel */}
        {selectedIssue && (
          <div className="w-80 border-l border-border p-4 bg-card/50 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-mono text-muted-foreground">{selectedIssue.key}</span>
              <button onClick={() => setSelectedIssueId(null)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={14} />
              </button>
            </div>
            <h3 className="font-semibold mb-4">{selectedIssue.title}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <select value={selectedIssue.status}
                  onChange={(e) => moveIssue(selectedIssue.id, e.target.value as IssueStatus)}
                  className="w-full px-3 py-1.5 bg-muted border border-border rounded-md text-sm">
                  {Object.entries(statusLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <div className="flex gap-1">
                  {(['urgent', 'high', 'medium', 'low', 'none'] as IssuePriority[]).map((p) => (
                    <button key={p} className={cn('flex-1 py-1.5 rounded text-xs capitalize',
                      selectedIssue.priority === p ? 'bg-primary/10 text-primary font-medium' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Labels</label>
                <div className="flex flex-wrap gap-1">
                  {selectedIssue.labels.map((l) => (
                    <span key={l} className="text-xs bg-muted px-2 py-0.5 rounded">{l}</span>
                  ))}
                  {selectedIssue.labels.length === 0 && <span className="text-xs text-muted-foreground">No labels</span>}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Created</label>
                <span className="text-sm">{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="pt-3 border-t border-border">
                <button onClick={() => { deleteIssue(selectedIssue.id); setSelectedIssueId(null); }}
                  className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80">
                  <Trash2 size={14} /> Delete Issue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
