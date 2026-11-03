export interface AudienceCondition {
	parameter: string;
	operator: "EQUALS" | "GREATER_THAN" | "CONTAINS";
	targetValue: any;
	scope: "EVENT" | "SESSION" | "USER";
}

export interface CustomAudience {
	id: string;
	name: string;
	conditions: AudienceCondition[];
	membershipDurationDays: number;
	audienceTriggerEventName?: string;
}

export interface UserEvaluationProfile {
	userId: string;
	lifetimePurchases: number;
	lifetimeRevenue: number;
	daysActiveLast28Days: number;
	lastActiveDaysAgo: number;
	parameters: Record<string, any>;
}

export class AudienceEngine {
	private audiences = new Map<string, CustomAudience>();
	private audienceTriggers = new Map<string, string>(); // audienceId -> eventName
	private userMemberships = new Map<string, Set<string>>(); // userId -> set(audienceIds)

	constructor(private is360 = false) {}

	public registerAudience(audience: CustomAudience): void {
		const limit = this.is360 ? 400 : 100;
		if (this.audiences.size >= limit) {
			throw new Error(`Audience limit reached: ${limit}`);
		}

		if (audience.audienceTriggerEventName) {
			if (this.audienceTriggers.size >= 20) {
				throw new Error("Audience triggers limit reached: 20");
			}
			this.audienceTriggers.set(audience.id, audience.audienceTriggerEventName);
		}

		this.audiences.set(audience.id, audience);
	}

	public evaluateUser(user: UserEvaluationProfile): {
		joinedAudiences: string[];
		triggeredEvents: string[];
	} {
		const currentMemberships =
			this.userMemberships.get(user.userId) ?? new Set();
		const joinedAudiences: string[] = [];
		const triggeredEvents: string[] = [];

		for (const audience of this.audiences.values()) {
			const matches = this.evaluateAudienceConditions(audience, user);

			if (matches && !currentMemberships.has(audience.id)) {
				currentMemberships.add(audience.id);
				joinedAudiences.push(audience.id);

				const triggerEvent = this.audienceTriggers.get(audience.id);
				if (triggerEvent) {
					triggeredEvents.push(triggerEvent);
				}
			}
		}

		this.userMemberships.set(user.userId, currentMemberships);
		return { joinedAudiences, triggeredEvents };
	}

	public calculatePredictiveMetrics(user: UserEvaluationProfile): {
		purchaseProbability: number;
		churnProbability: number;
		predicted28DayRevenue: number;
	} {
		// Probabilistic heuristic modeling active user patterns
		const purchaseProb = Math.min(
			1.0,
			(user.lifetimePurchases * 0.2 + user.daysActiveLast28Days * 0.05) / 2.0,
		);
		const churnProb = Math.min(
			1.0,
			Math.max(
				0.0,
				user.lastActiveDaysAgo * 0.15 - user.daysActiveLast28Days * 0.02,
			),
		);
		const predictedRev =
			purchaseProb > 0.3 ? Number((user.lifetimeRevenue * 0.4).toFixed(2)) : 0;

		return {
			purchaseProbability: Number(purchaseProb.toFixed(4)),
			churnProbability: Number(churnProb.toFixed(4)),
			predicted28DayRevenue: predictedRev,
		};
	}

	private evaluateAudienceConditions(
		audience: CustomAudience,
		user: UserEvaluationProfile,
	): boolean {
		return audience.conditions.every((cond) => {
			const val = user.parameters[cond.parameter];
			if (cond.operator === "EQUALS")
				return String(val) === String(cond.targetValue);
			if (cond.operator === "GREATER_THAN")
				return Number(val) > Number(cond.targetValue);
			if (cond.operator === "CONTAINS")
				return String(val).includes(String(cond.targetValue));
			return false;
		});
	}
}
