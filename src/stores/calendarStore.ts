import { create } from 'zustand';
import { CalendarEvent, Reminder, Holiday } from '@/types';
import { generateId } from '@/lib/utils';

interface CalendarState {
  events: CalendarEvent[];
  reminders: Reminder[];
  holidays: Holiday[];
  currentDate: string;
  currentView: 'month' | 'week' | 'day' | 'year';
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addReminder: (title: string, time: string, type?: Reminder['type']) => Reminder;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  setCurrentDate: (date: string) => void;
  setCurrentView: (view: 'month' | 'week' | 'day' | 'year') => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  getEventsForMonth: (year: number, month: number) => CalendarEvent[];
}

const defaultHolidays: Holiday[] = [
  { id: 'h1', name: "New Year's Day", date: '2026-01-01', country: 'US', type: 'public' },
  { id: 'h2', name: "MLK Day", date: '2026-01-19', country: 'US', type: 'public' },
  { id: 'h3', name: "Presidents Day", date: '2026-02-16', country: 'US', type: 'public' },
  { id: 'h4', name: "Memorial Day", date: '2026-05-25', country: 'US', type: 'public' },
  { id: 'h5', name: "Independence Day", date: '2026-07-04', country: 'US', type: 'public' },
  { id: 'h6', name: "Labor Day", date: '2026-09-07', country: 'US', type: 'public' },
  { id: 'h7', name: "Thanksgiving", date: '2026-11-26', country: 'US', type: 'public' },
  { id: 'h8', name: "Christmas Day", date: '2026-12-25', country: 'US', type: 'public' },
  { id: 'h9', name: "Valentine's Day", date: '2026-02-14', country: 'US', type: 'observance' },
  { id: 'h10', name: "Halloween", date: '2026-10-31', country: 'US', type: 'observance' },
];

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [
    {
      id: 'ev-1', title: 'NBOTION Sprint Planning', description: 'Plan next sprint goals',
      startDate: new Date().toISOString(), endDate: new Date(Date.now() + 3600000).toISOString(),
      allDay: false, color: '#8B5CF6', type: 'meeting', reminders: [],
    },
  ],
  reminders: [
    { id: 'rem-1', title: 'Review daily goals', time: '09:00', type: 'notification', completed: false },
    { id: 'rem-2', title: 'Evening reflection', time: '21:00', type: 'notification', completed: false },
  ],
  holidays: defaultHolidays,
  currentDate: new Date().toISOString().split('T')[0],
  currentView: 'month',
  addEvent: (event) => {
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    set((state) => ({ events: [...state.events, newEvent] }));
    return newEvent;
  },
  updateEvent: (id, updates) => {
    set((state) => ({ events: state.events.map((e) => e.id === id ? { ...e, ...updates } : e) }));
  },
  deleteEvent: (id) => {
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
  },
  addReminder: (title, time, type = 'notification') => {
    const reminder: Reminder = { id: generateId(), title, time, type, completed: false };
    set((state) => ({ reminders: [...state.reminders, reminder] }));
    return reminder;
  },
  toggleReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.map((r) => r.id === id ? { ...r, completed: !r.completed } : r),
    }));
  },
  deleteReminder: (id) => {
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
  },
  setCurrentDate: (date) => set({ currentDate: date }),
  setCurrentView: (view) => set({ currentView: view }),
  getEventsForDate: (date) => {
    return get().events.filter((e) => {
      const eventDate = new Date(e.startDate).toISOString().split('T')[0];
      return eventDate === date;
    });
  },
  getEventsForMonth: (year, month) => {
    return get().events.filter((e) => {
      const d = new Date(e.startDate);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },
}));
