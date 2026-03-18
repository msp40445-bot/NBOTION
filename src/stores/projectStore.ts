import { create } from 'zustand';
import { Project, Issue, Sprint, IssueStatus, IssuePriority } from '@/types';
import { generateId } from '@/lib/utils';

interface ProjectState {
  projects: Project[];
  issues: Issue[];
  sprints: Sprint[];
  currentProjectId: string | null;
  currentView: 'board' | 'list' | 'timeline';
  addProject: (name: string, key: string, color?: string) => Project;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  setCurrentView: (view: 'board' | 'list' | 'timeline') => void;
  addIssue: (projectId: string, title: string, status?: IssueStatus, priority?: IssuePriority) => Issue;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  moveIssue: (id: string, status: IssueStatus) => void;
  addSprint: (projectId: string, name: string, startDate: string, endDate: string) => Sprint;
  getProjectIssues: (projectId: string) => Issue[];
  getIssuesByStatus: (projectId: string) => Record<IssueStatus, Issue[]>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [
    {
      id: 'proj-1',
      name: 'NBOTION Development',
      key: 'NB',
      description: 'Building the ultimate all-in-one app',
      color: '#8B5CF6',
      createdAt: new Date().toISOString(),
    },
  ],
  issues: [
    {
      id: 'issue-1', projectId: 'proj-1', key: 'NB-1', title: 'Set up encrypted storage layer',
      status: 'done', priority: 'high', labels: ['core'], createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), comments: [],
    },
    {
      id: 'issue-2', projectId: 'proj-1', key: 'NB-2', title: 'Build rich text editor with blocks',
      status: 'in-progress', priority: 'high', labels: ['workspace'], createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), comments: [],
    },
    {
      id: 'issue-3', projectId: 'proj-1', key: 'NB-3', title: 'Implement messaging channels',
      status: 'todo', priority: 'medium', labels: ['messaging'], createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), comments: [],
    },
    {
      id: 'issue-4', projectId: 'proj-1', key: 'NB-4', title: 'Add AI agent framework',
      status: 'backlog', priority: 'medium', labels: ['ai'], createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), comments: [],
    },
  ],
  sprints: [],
  currentProjectId: 'proj-1',
  currentView: 'board',

  addProject: (name, key, color = '#8B5CF6') => {
    const project: Project = { id: generateId(), name, key, color, createdAt: new Date().toISOString() };
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      issues: state.issues.filter((i) => i.projectId !== id),
      currentProjectId: state.currentProjectId === id ? state.projects[0]?.id ?? null : state.currentProjectId,
    }));
  },

  setCurrentProject: (id) => set({ currentProjectId: id }),
  setCurrentView: (view) => set({ currentView: view }),

  addIssue: (projectId, title, status = 'backlog', priority = 'medium') => {
    const project = get().projects.find((p) => p.id === projectId);
    const count = get().issues.filter((i) => i.projectId === projectId).length + 1;
    const issue: Issue = {
      id: generateId(), projectId, key: `${project?.key ?? 'X'}-${count}`, title,
      status, priority, labels: [], createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), comments: [],
    };
    set((state) => ({ issues: [...state.issues, issue] }));
    return issue;
  },

  updateIssue: (id, updates) => {
    set((state) => ({
      issues: state.issues.map((i) => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i),
    }));
  },

  deleteIssue: (id) => {
    set((state) => ({ issues: state.issues.filter((i) => i.id !== id) }));
  },

  moveIssue: (id, status) => {
    set((state) => ({
      issues: state.issues.map((i) => i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i),
    }));
  },

  addSprint: (projectId, name, startDate, endDate) => {
    const sprint: Sprint = { id: generateId(), projectId, name, startDate, endDate, status: 'planning', issues: [] };
    set((state) => ({ sprints: [...state.sprints, sprint] }));
    return sprint;
  },

  getProjectIssues: (projectId) => get().issues.filter((i) => i.projectId === projectId),

  getIssuesByStatus: (projectId) => {
    const issues = get().issues.filter((i) => i.projectId === projectId);
    const statuses: IssueStatus[] = ['backlog', 'todo', 'in-progress', 'in-review', 'done', 'cancelled'];
    return Object.fromEntries(statuses.map((s) => [s, issues.filter((i) => i.status === s)])) as Record<IssueStatus, Issue[]>;
  },
}));
