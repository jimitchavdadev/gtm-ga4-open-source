import type { SessionState } from "./types";

export interface HitContext {
	clientId: string;
	userId?: string;
	timestampMs: number;
	eventName: string;
	isKeyEvent?: boolean;
	engagementTimeMs?: number;
	trafficSource?: {
		source?: string;
		medium?: string;
		campaign?: string;
	};
}

export class Sessionizer {
	private sessions = new Map<string, SessionState>();
	private clientLifetimeSessions = new Map<string, number>();

	constructor(
		private sessionTimeoutMinutes = 30,
		private engagedThresholdSeconds = 10,
	) {}

	public processHit(hit: HitContext): {
		session: SessionState;
		isNewSession: boolean;
	} {
		const timeoutMs = this.sessionTimeoutMinutes * 60 * 1000;
		const current = this.sessions.get(hit.clientId);

		const isExpired =
			!current || hit.timestampMs - current.lastEventTime > timeoutMs;

		let session: SessionState;
		let isNewSession = false;

		if (isExpired) {
			isNewSession = true;
			const lifetimeCount =
				(this.clientLifetimeSessions.get(hit.clientId) ?? 0) + 1;
			this.clientLifetimeSessions.set(hit.clientId, lifetimeCount);

			session = {
				clientId: hit.clientId,
				userId: hit.userId,
				sessionId: Math.floor(hit.timestampMs / 1000),
				sessionNumber: lifetimeCount,
				startTime: hit.timestampMs,
				lastEventTime: hit.timestampMs,
				engagementTimeMs: hit.engagementTimeMs ?? 0,
				pageViewCount: hit.eventName === "page_view" ? 1 : 0,
				hasKeyEvent: Boolean(hit.isKeyEvent),
				isEngaged: false,
				trafficSource: hit.trafficSource,
			};
		} else {
			session = { ...current };
			session.lastEventTime = hit.timestampMs;
			session.engagementTimeMs += hit.engagementTimeMs ?? 0;
			if (hit.userId && !session.userId) {
				session.userId = hit.userId;
			}
			if (hit.eventName === "page_view") {
				session.pageViewCount += 1;
			}
			if (hit.isKeyEvent) {
				session.hasKeyEvent = true;
			}
		}

		// Evaluate engagement status
		if (!session.isEngaged) {
			const hasMinTime =
				session.engagementTimeMs >= this.engagedThresholdSeconds * 1000;
			const hasMultiplePages = session.pageViewCount >= 2;
			if (hasMinTime || hasMultiplePages || session.hasKeyEvent) {
				session.isEngaged = true;
			}
		}

		this.sessions.set(hit.clientId, session);
		return { session, isNewSession };
	}

	public getSession(clientId: string): SessionState | undefined {
		return this.sessions.get(clientId);
	}

	public calculateMetrics(): {
		totalSessions: number;
		engagedSessions: number;
		engagementRate: number;
		bounceRate: number;
	} {
		const allSessions = Array.from(this.sessions.values());
		const total = allSessions.length;
		if (total === 0) {
			return {
				totalSessions: 0,
				engagedSessions: 0,
				engagementRate: 0,
				bounceRate: 0,
			};
		}
		const engaged = allSessions.filter((s) => s.isEngaged).length;
		const rate = engaged / total;
		return {
			totalSessions: total,
			engagedSessions: engaged,
			engagementRate: Number(rate.toFixed(4)),
			bounceRate: Number((1 - rate).toFixed(4)),
		};
	}
}
