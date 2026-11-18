export interface OnboardingConfig {
	containerId: string;
	propertyId: string;
	measurementId: string;
	streamName: string;
	streamUrl: string;
	analyticsStorage: "granted" | "denied";
	adStorage: "granted" | "denied";
	adUserData: "granted" | "denied";
	adPersonalization: "granted" | "denied";
	reportingIdentity: "blended" | "observed" | "device";
}

export interface VerificationResult {
	status: "idle" | "testing" | "success" | "error";
	message?: string;
	timestamp?: string;
	eventId?: string;
	gcs?: string;
}
