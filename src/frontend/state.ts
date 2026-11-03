import type { FrontendState } from "./types";

const initialState: FrontendState = {
	platform: "GTM",
	gtmTab: "OVERVIEW",
	ga4Tab: "HOME",
	accountId: "acc_1",
	containerId: "GTM-OPENSOURCE",
	propertyId: "prop_1",
	workspaceId: "ws_default",
	previewActive: false,
	tags: [],
	triggers: [],
	variables: [],
	versions: [],
	realtimeData: null,
	standardReports: null,
	attributionData: null,
	funnelData: null,
};

class Store {
	private state: FrontendState = { ...initialState };
	private listeners: Set<(state: FrontendState) => void> = new Set();

	public getState(): FrontendState {
		return this.state;
	}

	public setState(partial: Partial<FrontendState>): void {
		this.state = { ...this.state, ...partial };
		this.notify();
	}

	public subscribe(listener: (state: FrontendState) => void): () => void {
		this.listeners.add(listener);
		listener(this.state);
		return () => {
			this.listeners.delete(listener);
		};
	}

	public notify(): void {
		for (const listener of this.listeners) {
			listener(this.state);
		}
	}

	public notifyUser(
		message: string,
		type: "success" | "error" | "info" = "info",
	): void {
		this.setState({ notification: { message, type } });
		setTimeout(() => {
			if (this.state.notification?.message === message) {
				this.setState({ notification: undefined });
			}
		}, 4000);
	}
}

export const store = new Store();
