import { spawn } from 'node:child_process';

import waitOn from 'wait-on';

const ORION_WEB_DEV_PORT = 3000;
const ORION_WEB_DEV_HOST = 'localhost';

const bunCommand = process.platform === 'win32' ? 'bun.exe' : 'bun';
// Match the browser dev origin so Better Auth cookies and local session state line up.
const devServerUrl =
  process.env.VITE_DEV_SERVER_URL ?? `http://${ORION_WEB_DEV_HOST}:${ORION_WEB_DEV_PORT}`;

await waitOn({
  resources: [`tcp:${ORION_WEB_DEV_PORT}`],
  timeout: 60_000,
});

const child = spawn(bunCommand, ['x', 'electron-forge', 'start'], {
  cwd: new URL('..', import.meta.url),
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_DEV_SERVER_URL: devServerUrl,
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
