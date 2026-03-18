import { encryptData, decryptData } from './encryption';

interface StorageBackend {
  save(key: string, data: string, password: string): Promise<{ success: boolean; error?: string }>;
  load(key: string, password: string): Promise<{ success: boolean; data?: string | null; error?: string }>;
  delete(key: string): Promise<{ success: boolean; error?: string }>;
  list(): Promise<{ success: boolean; keys?: string[]; error?: string }>;
}

class ElectronStorage implements StorageBackend {
  async save(key: string, data: string, password: string) {
    return (window as any).nbotion.storage.save(key, data, password);
  }
  async load(key: string, password: string) {
    return (window as any).nbotion.storage.load(key, password);
  }
  async delete(key: string) {
    return (window as any).nbotion.storage.delete(key);
  }
  async list() {
    return (window as any).nbotion.storage.list();
  }
}

class BrowserStorage implements StorageBackend {
  private prefix = 'nbotion_';

  async save(key: string, data: string, password: string) {
    try {
      const encrypted = await encryptData(data, password);
      localStorage.setItem(this.prefix + key, encrypted);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async load(key: string, password: string) {
    try {
      const encrypted = localStorage.getItem(this.prefix + key);
      if (!encrypted) return { success: true, data: null };
      const data = await decryptData(encrypted, password);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async delete(key: string) {
    localStorage.removeItem(this.prefix + key);
    return { success: true };
  }

  async list() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(this.prefix)) {
        keys.push(k.replace(this.prefix, ''));
      }
    }
    return { success: true, keys };
  }
}

function isElectron(): boolean {
  return typeof (window as any).nbotion !== 'undefined';
}

export const storage: StorageBackend = isElectron() ? new ElectronStorage() : new BrowserStorage();

export class SecureStore {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  async saveJSON<T>(key: string, data: T): Promise<boolean> {
    const result = await storage.save(key, JSON.stringify(data), this.password);
    return result.success;
  }

  async loadJSON<T>(key: string): Promise<T | null> {
    const result = await storage.load(key, this.password);
    if (!result.success || !result.data) return null;
    try {
      return JSON.parse(result.data) as T;
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await storage.delete(key);
    return result.success;
  }

  async listKeys(): Promise<string[]> {
    const result = await storage.list();
    return result.keys ?? [];
  }
}
