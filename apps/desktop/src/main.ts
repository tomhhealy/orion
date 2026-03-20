import { app, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let reloadTimer: ReturnType<typeof setTimeout> | null = null;

function resolvePackagedIndexHtml(): string {
  return path.join(process.resourcesPath, 'client', 'index.html');
}

function resolveLocalIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../web/dist/client/index.html'),
    path.resolve(__dirname, '../../../web/dist/client/index.html'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function scheduleReload(window: BrowserWindow) {
  if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return;
  }

  if (reloadTimer !== null) {
    clearTimeout(reloadTimer);
  }

  reloadTimer = setTimeout(() => {
    reloadTimer = null;
    void window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  }, 1000);
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    title: 'Orion',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    const indexHtml = app.isPackaged ? resolvePackagedIndexHtml() : resolveLocalIndexHtml();
    void mainWindow.loadFile(indexHtml);
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.webContents.on('did-fail-load', () => {
      if (mainWindow) {
        scheduleReload(mainWindow);
      }
    });
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
