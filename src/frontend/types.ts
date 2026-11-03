export type PlatformMode = "GTM" | "GA4";

export type GtmTab =
	| "OVERVIEW"
	| "TAGS"
	| "TRIGGERS"
	| "VARIABLES"
	| "FOLDERS"
	| "PREVIEW"
	| "ZONES"
	| "APPROVALS";

export type Ga4Tab =
	| "HOME"
	| "REALTIME"
	| "REPORTS"
	| "EXPLORE"
	| "ATTRIBUTION"
	| "AUDIENCES"
	| "DEBUGVIEW"
	| "ADMIN";

export interface FrontendState {
	platform: PlatformMode;
	gtmTab: GtmTab;
	ga4Tab: Ga4Tab;
	accountId: string;
	containerId: string;
	propertyId: string;
	workspaceId: string;
	previewActive: boolean;
	tags: any[];
	triggers: any[];
	variables: any[];
	versions: any[];
	realtimeData: any;
	standardReports: any;
	attributionData: any;
	funnelData: any;
	notification?: { message: string; type: "success" | "error" | "info" };
}
