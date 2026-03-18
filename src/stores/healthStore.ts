import { create } from 'zustand';
import { HealthData, Integration } from '@/types';
import { generateId } from '@/lib/utils';

interface HealthState {
  healthData: HealthData[];
  integrations: Integration[];
  addHealthData: (data: Omit<HealthData, 'id'>) => void;
  deleteHealthData: (id: string) => void;
  addIntegration: (integration: Omit<Integration, 'id'>) => void;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  removeIntegration: (id: string) => void;
  getDataByType: (type: HealthData['type']) => HealthData[];
  getDataByDateRange: (start: string, end: string) => HealthData[];
}

export const useHealthStore = create<HealthState>((set, get) => ({
  healthData: [
    { id: 'hd-1', date: new Date().toISOString().split('T')[0], type: 'sleep', value: 7.5, unit: 'hours', source: 'manual' },
    { id: 'hd-2', date: new Date().toISOString().split('T')[0], type: 'steps', value: 8500, unit: 'steps', source: 'manual' },
    { id: 'hd-3', date: new Date().toISOString().split('T')[0], type: 'rhr', value: 62, unit: 'bpm', source: 'manual' },
    { id: 'hd-4', date: new Date().toISOString().split('T')[0], type: 'hrv', value: 45, unit: 'ms', source: 'manual' },
    { id: 'hd-5', date: new Date().toISOString().split('T')[0], type: 'recovery', value: 72, unit: '%', source: 'manual' },
    { id: 'hd-6', date: new Date().toISOString().split('T')[0], type: 'strain', value: 12.5, unit: 'score', source: 'manual' },
    { id: 'hd-7', date: new Date().toISOString().split('T')[0], type: 'calories', value: 2200, unit: 'kcal', source: 'manual' },
  ],
  integrations: [
    { id: 'int-whoop', type: 'whoop', name: 'Whoop', status: 'disconnected', config: {} },
    { id: 'int-gh', type: 'github', name: 'GitHub', status: 'disconnected', config: {} },
    { id: 'int-tg', type: 'telegram', name: 'Telegram', status: 'disconnected', config: {} },
    { id: 'int-dc', type: 'discord', name: 'Discord', status: 'disconnected', config: {} },
    { id: 'int-gcal', type: 'google-calendar', name: 'Google Calendar', status: 'disconnected', config: {} },
    { id: 'int-slack', type: 'slack', name: 'Slack', status: 'disconnected', config: {} },
  ],
  addHealthData: (data) => {
    set((state) => ({ healthData: [...state.healthData, { ...data, id: generateId() }] }));
  },
  deleteHealthData: (id) => {
    set((state) => ({ healthData: state.healthData.filter((d) => d.id !== id) }));
  },
  addIntegration: (integration) => {
    set((state) => ({ integrations: [...state.integrations, { ...integration, id: generateId() }] }));
  },
  updateIntegration: (id, updates) => {
    set((state) => ({
      integrations: state.integrations.map((i) => i.id === id ? { ...i, ...updates } : i),
    }));
  },
  removeIntegration: (id) => {
    set((state) => ({ integrations: state.integrations.filter((i) => i.id !== id) }));
  },
  getDataByType: (type) => get().healthData.filter((d) => d.type === type),
  getDataByDateRange: (start, end) => {
    return get().healthData.filter((d) => d.date >= start && d.date <= end);
  },
}));
