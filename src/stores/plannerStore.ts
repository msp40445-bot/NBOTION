import { create } from 'zustand';
import { Goal, Milestone } from '@/types';
import { generateId } from '@/lib/utils';

interface PlannerState {
  goals: Goal[];
  currentTimeframe: string;
  addGoal: (title: string, category: Goal['category'], timeframe: Goal['timeframe'], targetDate: string) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, title: string, dueDate?: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  setCurrentTimeframe: (timeframe: string) => void;
  getGoalsByTimeframe: (timeframe: string) => Goal[];
  getGoalsByCategory: (category: string) => Goal[];
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  goals: [
    {
      id: 'goal-1', title: 'Launch NBOTION v1.0', description: 'Complete all core modules and release the first version',
      category: 'career', timeframe: '1-year', status: 'in-progress', progress: 35,
      milestones: [
        { id: 'm1', title: 'Core workspace module', completed: true, completedAt: new Date().toISOString() },
        { id: 'm2', title: 'Messaging system', completed: false },
        { id: 'm3', title: 'Project management', completed: false },
        { id: 'm4', title: 'AI agent framework', completed: false },
        { id: 'm5', title: 'Health integrations', completed: false },
      ],
      startDate: new Date().toISOString(),
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'goal-2', title: 'Build a sustainable business', description: 'Grow NBOTION to 10k users',
      category: 'career', timeframe: '5-years', status: 'not-started', progress: 0,
      milestones: [
        { id: 'm6', title: 'First 100 users', completed: false },
        { id: 'm7', title: 'Revenue positive', completed: false },
        { id: 'm8', title: '10,000 users', completed: false },
      ],
      startDate: new Date().toISOString(),
      targetDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  currentTimeframe: 'all',

  addGoal: (title, category, timeframe, targetDate) => {
    const goal: Goal = {
      id: generateId(), title, category, timeframe, status: 'not-started', progress: 0,
      milestones: [], startDate: new Date().toISOString(), targetDate,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    set((state) => ({ goals: [...state.goals, goal] }));
    return goal;
  },

  updateGoal: (id, updates) => {
    set((state) => ({
      goals: state.goals.map((g) => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g),
    }));
  },

  deleteGoal: (id) => {
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },

  addMilestone: (goalId, title, dueDate) => {
    const milestone: Milestone = { id: generateId(), title, completed: false, dueDate };
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId ? { ...g, milestones: [...g.milestones, milestone] } : g
      ),
    }));
  },

  toggleMilestone: (goalId, milestoneId) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined } : m
              ),
              progress: Math.round(
                (g.milestones.filter((m) => (m.id === milestoneId ? !m.completed : m.completed)).length / g.milestones.length) * 100
              ),
            }
          : g
      ),
    }));
  },

  deleteMilestone: (goalId, milestoneId) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) } : g
      ),
    }));
  },

  setCurrentTimeframe: (timeframe) => set({ currentTimeframe: timeframe }),

  getGoalsByTimeframe: (timeframe) => {
    if (timeframe === 'all') return get().goals;
    return get().goals.filter((g) => g.timeframe === timeframe);
  },

  getGoalsByCategory: (category) => {
    if (category === 'all') return get().goals;
    return get().goals.filter((g) => g.category === category);
  },
}));
