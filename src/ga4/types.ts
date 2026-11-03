export type ReportingIdentityMode = "BLENDED" | "OBSERVED" | "DEVICE_BASED";

export interface SessionState {
	clientId: string;
	userId?: string;
	sessionId: number;
	sessionNumber: number;
	startTime: number;
	lastEventTime: number;
	engagementTimeMs: number;
	pageViewCount: number;
	hasKeyEvent: boolean;
	isEngaged: boolean;
	trafficSource?: {
		source?: string;
		medium?: string;
		campaign?: string;
	};
}

export interface Ga4Event {
	id: string;
	name: string;
	clientId: string;
	userId?: string;
	timestampMicros: number;
	params: Record<string, any>;
	userProperties?: Record<string, any>;
	items?: Array<Record<string, any>>;
	isKeyEvent?: boolean;
}

export interface ResolvedIdentity {
	canonicalUserId: string;
	identityTier: "USER_ID" | "SIGNALS" | "DEVICE_ID" | "MODELED";
	isThresholded: boolean;
}
