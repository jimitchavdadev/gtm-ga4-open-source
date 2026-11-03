export type ConsentStatus = "granted" | "denied";

export type ConsentType =
	| "ad_storage"
	| "analytics_storage"
	| "ad_user_data"
	| "ad_personalization"
	| "functionality_storage"
	| "personalization_storage"
	| "security_storage";

export interface ConsentState {
	defaultStatus?: ConsentStatus;
	updatedStatus?: ConsentStatus;
}

export class ConsentManager {
	private consentStore = new Map<ConsentType, ConsentState>();
	private waitForUpdateMs = 0;
	private initializedAt = Date.now();

	public setDefault(
		consents: Partial<Record<ConsentType, ConsentStatus>>,
		waitForUpdate = 0,
	): void {
		this.waitForUpdateMs = waitForUpdate;
		this.initializedAt = Date.now();
		for (const [key, val] of Object.entries(consents)) {
			const type = key as ConsentType;
			const current = this.consentStore.get(type) ?? {};
			current.defaultStatus = val;
			this.consentStore.set(type, current);
		}
	}

	public setUpdate(
		consents: Partial<Record<ConsentType, ConsentStatus>>,
	): void {
		for (const [key, val] of Object.entries(consents)) {
			const type = key as ConsentType;
			const current = this.consentStore.get(type) ?? {};
			current.updatedStatus = val;
			this.consentStore.set(type, current);
		}
	}

	public isGranted(type: ConsentType): boolean {
		const state = this.consentStore.get(type);
		if (!state) return false;
		if (state.updatedStatus !== undefined) {
			return state.updatedStatus === "granted";
		}
		return state.defaultStatus === "granted";
	}

	public hasResolved(): boolean {
		if (this.waitForUpdateMs === 0) return true;
		return Date.now() - this.initializedAt >= this.waitForUpdateMs;
	}

	public encodeGcs(): string {
		const ad = this.isGranted("ad_storage") ? "1" : "0";
		const an = this.isGranted("analytics_storage") ? "1" : "0";
		return `G1${ad}${an}`;
	}

	public encodeGcd(): string {
		const encodeType = (type: ConsentType): string => {
			const s = this.consentStore.get(type);
			if (!s) return "l";
			const def = s.defaultStatus;
			const upd = s.updatedStatus;
			if (def === "denied" && upd === undefined) return "p";
			if (def === "denied" && upd === "denied") return "q";
			if (def === "denied" && upd === "granted") return "r";
			if (def === "granted" && upd === undefined) return "t";
			if (def === undefined && upd === "denied") return "m";
			if (def === undefined && upd === "granted") return "n";
			if (def === "granted" && upd === "denied") return "u";
			if (def === "granted" && upd === "granted") return "v";
			return "l";
		};

		const adStorage = encodeType("ad_storage");
		const analytics = encodeType("analytics_storage");
		const adUserData = encodeType("ad_user_data");
		const adPersonalization = encodeType("ad_personalization");

		return `13${adStorage}3${analytics}3${adUserData}3${adPersonalization}5`;
	}
}
