import { create } from 'zustand';
import { Page, DatabaseColumn, DatabaseRow } from '@/types';
import { generateId } from '@/lib/utils';

interface WorkspaceState {
  pages: Page[];
  currentPageId: string | null;
  searchQuery: string;
  addPage: (parentId?: string) => Page;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  setCurrentPage: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  addDatabase: (parentId?: string) => Page;
  addDatabaseColumn: (pageId: string, column: Omit<DatabaseColumn, 'id'>) => void;
  addDatabaseRow: (pageId: string) => void;
  updateDatabaseCell: (pageId: string, rowId: string, columnId: string, value: any) => void;
  deleteDatabaseRow: (pageId: string, rowId: string) => void;
  getPageTree: () => Page[];
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  pages: [
    {
      id: 'welcome',
      title: 'Welcome to NBOTION',
      icon: '🚀',
      content: '<h1>Welcome to NBOTION</h1><p>Your ultimate all-in-one workspace. Start by creating a new page or exploring the modules in the sidebar.</p><ul><li><strong>Workspace</strong> - Create pages, databases, and rich documents</li><li><strong>Messages</strong> - Team communication with channels and DMs</li><li><strong>Projects</strong> - Track issues, sprints, and project boards</li><li><strong>Planner</strong> - Set goals with timelines (1 year, 5 year, 10 year)</li><li><strong>Calendar</strong> - Events, reminders, holidays, and alarms</li><li><strong>Health</strong> - Connect Whoop, track health data</li><li><strong>Integrations</strong> - Telegram, Discord, GitHub</li><li><strong>AI Agents</strong> - Build and run local AI agents with Qwen</li></ul>',
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  currentPageId: 'welcome',
  searchQuery: '',

  addPage: (parentId) => {
    const newPage: Page = {
      id: generateId(),
      title: 'Untitled',
      content: '',
      parentId,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => {
      const pages = [...state.pages, newPage];
      if (parentId) {
        const parentIndex = pages.findIndex((p) => p.id === parentId);
        if (parentIndex !== -1) {
          pages[parentIndex] = {
            ...pages[parentIndex],
            children: [...pages[parentIndex].children, newPage.id],
          };
        }
      }
      return { pages, currentPageId: newPage.id };
    });
    return newPage;
  },

  updatePage: (id, updates) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deletePage: (id) => {
    set((state) => {
      const page = state.pages.find((p) => p.id === id);
      if (!page) return state;
      const pages = state.pages.filter((p) => p.id !== id);
      if (page.parentId) {
        const parentIndex = pages.findIndex((p) => p.id === page.parentId);
        if (parentIndex !== -1) {
          pages[parentIndex] = {
            ...pages[parentIndex],
            children: pages[parentIndex].children.filter((c) => c !== id),
          };
        }
      }
      return {
        pages,
        currentPageId: state.currentPageId === id ? (pages[0]?.id ?? null) : state.currentPageId,
      };
    });
  },

  setCurrentPage: (id) => set({ currentPageId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addDatabase: (parentId) => {
    const newPage: Page = {
      id: generateId(),
      title: 'Untitled Database',
      icon: '📊',
      content: '',
      parentId,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDatabase: true,
      databaseSchema: [
        { id: generateId(), name: 'Name', type: 'text' },
        { id: generateId(), name: 'Status', type: 'select', options: [
          { id: generateId(), name: 'Not Started', color: '#6B7280' },
          { id: generateId(), name: 'In Progress', color: '#F59E0B' },
          { id: generateId(), name: 'Done', color: '#10B981' },
        ]},
        { id: generateId(), name: 'Date', type: 'date' },
      ],
      databaseRows: [],
    };
    set((state) => ({
      pages: [...state.pages, newPage],
      currentPageId: newPage.id,
    }));
    return newPage;
  },

  addDatabaseColumn: (pageId, column) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? { ...p, databaseSchema: [...(p.databaseSchema ?? []), { ...column, id: generateId() }] }
          : p
      ),
    }));
  },

  addDatabaseRow: (pageId) => {
    const row: DatabaseRow = {
      id: generateId(),
      cells: {},
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? { ...p, databaseRows: [...(p.databaseRows ?? []), row] }
          : p
      ),
    }));
  },

  updateDatabaseCell: (pageId, rowId, columnId, value) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              databaseRows: (p.databaseRows ?? []).map((r) =>
                r.id === rowId ? { ...r, cells: { ...r.cells, [columnId]: value } } : r
              ),
            }
          : p
      ),
    }));
  },

  deleteDatabaseRow: (pageId, rowId) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId
          ? { ...p, databaseRows: (p.databaseRows ?? []).filter((r) => r.id !== rowId) }
          : p
      ),
    }));
  },

  getPageTree: () => {
    const state = get();
    return state.pages.filter((p) => !p.parentId);
  },
}));
