import { create } from 'zustand';
import { AppModule } from '@/types';

interface AppState {
  currentModule: AppModule;
  sidebarOpen: boolean;
  sidebarWidth: number;
  theme: 'dark' | 'light';
  encryptionPassword: string | null;
  isLocked: boolean;
  setCurrentModule: (module: AppModule) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setEncryptionPassword: (password: string | null) => void;
  lock: () => void;
  unlock: (password: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentModule: 'workspace',
  sidebarOpen: true,
  sidebarWidth: 260,
  theme: 'dark',
  encryptionPassword: null,
  isLocked: false,
  setCurrentModule: (module) => set({ currentModule: module }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  },
  setEncryptionPassword: (password) => set({ encryptionPassword: password }),
  lock: () => set({ isLocked: true }),
  unlock: (password) => set({ isLocked: false, encryptionPassword: password }),
}));
