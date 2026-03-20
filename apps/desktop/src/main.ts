import { app, BrowserWindow } from 'electron';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let localWebServerProcess: ChildProcess | null = null;
let localWebServerUrl: string | null = null;
let reloadTimer: ReturnType<typeof setTimeout> | null = null;

function resolvePackagedResource(...segments: string[]): string {
  return path.join(process.resourcesPath, ...segments);
}

function resolveLocalPath(...segments: string[]): string {
  const candidates = [
    path.resolve(__dirname, ...segments),
    path.resolve(__dirname, '..', ...segments),
    path.resolve(__dirname, '..', '..', ...segments),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function resolveWebServerEntry(): string {
  return app.isPackaged
    ? resolvePackagedResource('server', 'server.js')
    : resolveLocalPath('../../web/dist/server/server.js');
}

function resolveWebStaticDir(): string {
  return app.isPackaged
    ? resolvePackagedResource('client')
    : resolveLocalPath('../../web/dist/client');
}

function resolveWebLauncherScript(): string {
  return app.isPackaged
    ? resolvePackagedResource('orion-web-server.mjs')
    : resolveLocalPath('../resources/orion-web-server.mjs');
}

async function getAvailablePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = createServer();

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        if (!address || typeof address === 'string') {
          reject(new Error('Unable to determine a local port.'));
          return;
        }

        resolve(address.port);
      });
    });
  });
}

async function waitForLocalWebServer(url: string) {
  const startedAt = Date.now();
  const timeoutMs = 20_000;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(new URL('/sign-in', url), {
        redirect: 'manual',
      });
      if (response.ok || response.status === 302) {
        return;
      }
    } catch {
      // Retry until the local server becomes reachable.
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Timed out waiting for Orion web server at ${url}`);
}

async function ensureLocalWebServer(): Promise<string> {
  if (localWebServerUrl && localWebServerProcess && !localWebServerProcess.killed) {
    return localWebServerUrl;
  }

  const port = await getAvailablePort();
  const host = '127.0.0.1';
  const url = `http://${host}:${String(port)}`;

  const child = spawn(process.execPath, [resolveWebLauncherScript()], {
    stdio: 'pipe',
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      ORION_WEB_HOST: host,
      ORION_WEB_PORT: String(port),
      ORION_WEB_SERVER_ENTRY: resolveWebServerEntry(),
      ORION_WEB_STATIC_DIR: resolveWebStaticDir(),
      SITE_URL: url,
      VITE_SITE_URL: url,
    },
  });

  child.stdout?.on('data', (chunk) => {
    process.stdout.write(`[orion-web] ${String(chunk)}`);
  });
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(`[orion-web] ${String(chunk)}`);
  });
  child.once('exit', () => {
    localWebServerProcess = null;
    localWebServerUrl = null;
  });

  localWebServerProcess = child;
  localWebServerUrl = url;

  await waitForLocalWebServer(url);

  return url;
}

function stopLocalWebServer() {
  if (!localWebServerProcess || localWebServerProcess.killed) {
    return;
  }

  localWebServerProcess.kill();
  localWebServerProcess = null;
  localWebServerUrl = null;
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

const createWindow = async () => {
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
    const appUrl = await ensureLocalWebServer();
    void mainWindow.loadURL(appUrl);
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

app.on('ready', () => {
  void createWindow();
});

app.on('before-quit', () => {
  stopLocalWebServer();
});

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
