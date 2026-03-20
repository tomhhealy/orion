export interface DesktopRuntimeInfo {
	readonly isDesktop: true;
	readonly platform: string;
	readonly arch: string;
	readonly electronVersion: string;
}

export interface DesktopBridge {
	isDesktop(): true;
	getRuntimeInfo(): DesktopRuntimeInfo;
}
