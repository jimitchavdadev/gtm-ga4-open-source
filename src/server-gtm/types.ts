export interface CanonicalEventData {
	event_name: string;
	client_id: string;
	user_id?: string;
	session_id?: number;
	session_number?: number;
	page_location: string;
	page_referrer?: string;
	page_title?: string;
	ip_override?: string;
	user_agent?: string;
	items?: Array<Record<string, any>>;
	user_data?: {
		email_address?: string;
		phone_number?: string;
		address?: Record<string, string>;
	};
	event_params: Record<string, any>;
	user_properties?: Record<string, any>;
	consent?: {
		ad_storage?: string;
		analytics_storage?: string;
		ad_user_data?: string;
		ad_personalization?: string;
	};
}

export interface ServerTransformationRule {
	id: string;
	priority: number;
	action: "ALLOWLIST" | "BLOCKLIST" | "HASH_SHA256" | "AUGMENT";
	targetFields: string[];
	augmentData?: Record<string, any>;
}
