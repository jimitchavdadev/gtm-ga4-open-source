import { describe, expect, it } from "bun:test";
import { IdentityGraph } from "../src/ga4/identity-graph";
import { Sessionizer } from "../src/ga4/sessionizer";

describe("GA4 Sessionization & Identity Graph (Module 6)", () => {
	it("sessionizes hits, handles inactivity timeouts, and tracks session count", () => {
		const sessionizer = new Sessionizer(30, 10); // 30 min timeout, 10s engaged

		const baseTime = 1700000000000;
		// Hit 1: initial page view
		const r1 = sessionizer.processHit({
			clientId: "user_a",
			timestampMs: baseTime,
			eventName: "page_view",
		});
		expect(r1.isNewSession).toBe(true);
		expect(r1.session.sessionNumber).toBe(1);
		expect(r1.session.pageViewCount).toBe(1);
		expect(r1.session.isEngaged).toBe(false);

		// Hit 2: 5 minutes later, page 2
		const r2 = sessionizer.processHit({
			clientId: "user_a",
			timestampMs: baseTime + 5 * 60 * 1000,
			eventName: "page_view",
		});
		expect(r2.isNewSession).toBe(false);
		expect(r2.session.pageViewCount).toBe(2);
		expect(r2.session.isEngaged).toBe(true); // Engaged because 2+ pageviews!

		// Hit 3: 35 minutes later (session expired!)
		const r3 = sessionizer.processHit({
			clientId: "user_a",
			timestampMs: baseTime + 40 * 60 * 1000,
			eventName: "page_view",
		});
		expect(r3.isNewSession).toBe(true);
		expect(r3.session.sessionNumber).toBe(2);
		expect(r3.session.pageViewCount).toBe(1);
	});

	it("qualifies engagement by engagement time or key events", () => {
		const sessionizer = new Sessionizer(30, 10);
		const baseTime = 1700000000000;

		// Session with key event qualifies immediately
		const r1 = sessionizer.processHit({
			clientId: "lead_user",
			timestampMs: baseTime,
			eventName: "generate_lead",
			isKeyEvent: true,
		});
		expect(r1.session.isEngaged).toBe(true);

		// Session with >=10s engagement qualifies
		const r2 = sessionizer.processHit({
			clientId: "timer_user",
			timestampMs: baseTime,
			eventName: "scroll",
			engagementTimeMs: 12000,
		});
		expect(r2.session.isEngaged).toBe(true);

		const metrics = sessionizer.calculateMetrics();
		expect(metrics.totalSessions).toBe(2);
		expect(metrics.engagedSessions).toBe(2);
		expect(metrics.engagementRate).toBe(1.0);
		expect(metrics.bounceRate).toBe(0.0);
	});

	it("resolves identities across Blended, Observed, and Device-Based modes", () => {
		const graph = new IdentityGraph("BLENDED");

		graph.registerIdentity({
			clientId: "device_abc",
			userId: "auth_user_99",
			signalsId: "sig_123",
		});

		// 1. Blended mode selects User-ID first
		const blended = graph.resolveIdentity("device_abc");
		expect(blended.canonicalUserId).toBe("auth_user_99");
		expect(blended.identityTier).toBe("USER_ID");
		expect(blended.isThresholded).toBe(false);

		// 2. Signals-only identity in Blended/Observed triggers thresholding
		graph.registerIdentity({
			clientId: "device_xyz",
			signalsId: "sig_789",
		});
		const signalsId = graph.resolveIdentity("device_xyz");
		expect(signalsId.canonicalUserId).toBe("sig_789");
		expect(signalsId.identityTier).toBe("SIGNALS");
		expect(signalsId.isThresholded).toBe(true);

		// 3. Device-Based mode eliminates thresholding completely
		graph.setReportingMode("DEVICE_BASED");
		const deviceOnly = graph.resolveIdentity("device_xyz");
		expect(deviceOnly.canonicalUserId).toBe("device_xyz");
		expect(deviceOnly.identityTier).toBe("DEVICE_ID");
		expect(deviceOnly.isThresholded).toBe(false);
	});
});
