import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nbotion', {
  storage: {
    save: (key: string, data: string, password: string) =>
      ipcRenderer.invoke('storage:save', key, data, password),
    load: (key: string, password: string) =>
      ipcRenderer.invoke('storage:load', key, password),
    delete: (key: string) =>
      ipcRenderer.invoke('storage:delete', key),
    list: () =>
      ipcRenderer.invoke('storage:list'),
  },
  platform: process.platform,
});
