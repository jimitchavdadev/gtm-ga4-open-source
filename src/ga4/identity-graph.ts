import type { ReportingIdentityMode, ResolvedIdentity } from "./types";

export interface IdentityProfile {
	clientId: string;
	userId?: string;
	signalsId?: string;
	isModeled?: boolean;
}

export class IdentityGraph {
	private profiles = new Map<string, IdentityProfile>();
	private userToClients = new Map<string, Set<string>>();

	constructor(private mode: ReportingIdentityMode = "BLENDED") {}

	public setReportingMode(mode: ReportingIdentityMode): void {
		this.mode = mode;
	}

	public getReportingMode(): ReportingIdentityMode {
		return this.mode;
	}

	public registerIdentity(profile: IdentityProfile): void {
		this.profiles.set(profile.clientId, profile);

		if (profile.userId) {
			const set = this.userToClients.get(profile.userId) ?? new Set();
			set.add(profile.clientId);
			this.userToClients.set(profile.userId, set);
		}
	}

	public resolveIdentity(clientId: string): ResolvedIdentity {
		const profile = this.profiles.get(clientId) ?? { clientId };

		if (this.mode === "DEVICE_BASED") {
			// Device ID only: bypasses Google Signals data thresholding!
			return {
				canonicalUserId: profile.clientId,
				identityTier: "DEVICE_ID",
				isThresholded: false,
			};
		}

		if (this.mode === "OBSERVED") {
			if (profile.userId) {
				return {
					canonicalUserId: profile.userId,
					identityTier: "USER_ID",
					isThresholded: false,
				};
			}
			if (profile.signalsId) {
				return {
					canonicalUserId: profile.signalsId,
					identityTier: "SIGNALS",
					isThresholded: true, // Google Signals triggers privacy thresholding
				};
			}
			return {
				canonicalUserId: profile.clientId,
				identityTier: "DEVICE_ID",
				isThresholded: false,
			};
		}

		// BLENDED mode (User-ID -> Signals -> Device ID -> Modeled)
		if (profile.userId) {
			return {
				canonicalUserId: profile.userId,
				identityTier: "USER_ID",
				isThresholded: false,
			};
		}
		if (profile.signalsId) {
			return {
				canonicalUserId: profile.signalsId,
				identityTier: "SIGNALS",
				isThresholded: true,
			};
		}
		if (profile.isModeled) {
			return {
				canonicalUserId: `modeled_${profile.clientId}`,
				identityTier: "MODELED",
				isThresholded: false,
			};
		}

		return {
			canonicalUserId: profile.clientId,
			identityTier: "DEVICE_ID",
			isThresholded: false,
		};
	}

	public getLinkedDevicesForUser(userId: string): string[] {
		const set = this.userToClients.get(userId);
		return set ? Array.from(set) : [];
	}
}
