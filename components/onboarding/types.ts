export type PlatformType = "web" | "android" | "ios" | "server";

export interface OnboardingConfig {
	containerId: string;
	propertyId: string;
	measurementId: string;
	streamName: string;
	streamUrl: string;
	platformType: PlatformType;
	appPackageName: string;
	bundleId: string;
	appVersion: string;
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
	platform?: string;
}
