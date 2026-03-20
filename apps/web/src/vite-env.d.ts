import type { DesktopBridge } from '@tomhhealy/contracts'

declare global {
  interface Window {
    desktopBridge?: DesktopBridge
  }
}

export {}
