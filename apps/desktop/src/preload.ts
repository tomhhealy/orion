import { contextBridge } from 'electron';

import type { DesktopBridge } from '@tomhhealy/contracts';

const desktopBridge: DesktopBridge = {
  isDesktop() {
    return true;
  },
  getRuntimeInfo() {
    return {
      isDesktop: true,
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
    };
  },
};

contextBridge.exposeInMainWorld('desktopBridge', desktopBridge);
