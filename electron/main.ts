import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const ITERATIONS = 100000;

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

function encrypt(data: string, password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return salt.toString('hex') + ':' + iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData: string, password: string): string {
  const parts = encryptedData.split(':');
  const salt = Buffer.from(parts[0], 'hex');
  const iv = Buffer.from(parts[1], 'hex');
  const tag = Buffer.from(parts[2], 'hex');
  const encrypted = parts[3];
  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function getDataPath(): string {
  return path.join(app.getPath('userData'), 'nbotion-data');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    frame: process.platform === 'darwin' ? false : true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0a0a0f',
  });

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Ensure data directory exists
  const dataPath = getDataPath();
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  // IPC Handlers for encrypted storage
  ipcMain.handle('storage:save', async (_event, key: string, data: string, password: string) => {
    try {
      const encrypted = encrypt(data, password);
      const filePath = path.join(getDataPath(), `${key}.enc`);
      fs.writeFileSync(filePath, encrypted, 'utf8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('storage:load', async (_event, key: string, password: string) => {
    try {
      const filePath = path.join(getDataPath(), `${key}.enc`);
      if (!fs.existsSync(filePath)) {
        return { success: true, data: null };
      }
      const encrypted = fs.readFileSync(filePath, 'utf8');
      const decrypted = decrypt(encrypted, password);
      return { success: true, data: decrypted };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('storage:delete', async (_event, key: string) => {
    try {
      const filePath = path.join(getDataPath(), `${key}.enc`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('storage:list', async () => {
    try {
      const files = fs.readdirSync(getDataPath())
        .filter(f => f.endsWith('.enc'))
        .map(f => f.replace('.enc', ''));
      return { success: true, keys: files };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
