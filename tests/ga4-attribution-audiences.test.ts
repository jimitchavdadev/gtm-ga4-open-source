import { describe, expect, it } from "bun:test";
import {
	AttributionEngine,
	type ConversionJourney,
} from "../src/ga4/attribution";
import { AudienceEngine } from "../src/ga4/audiences";

describe("GA4 Attribution & Predictive Audiences (Module 8)", () => {
	it("calculates Cross-Channel Last Click ignoring direct where possible", () => {
		const journeys: ConversionJourney[] = [
			{
				id: "j1",
				touchpoints: [
					{ channel: "Paid Search", timestamp: 1 },
					{ channel: "Direct", timestamp: 2 },
				],
				converted: true,
				revenue: 100,
			},
			{
				id: "j2",
				touchpoints: [
					{ channel: "Organic Social", timestamp: 1 },
					{ channel: "Email", timestamp: 2 },
				],
				converted: true,
				revenue: 200,
			},
		];

		const lastClick = AttributionEngine.calculateLastClick(journeys);
		expect(lastClick["Paid Search"]).toBe(100); // Direct was ignored!
		expect(lastClick.Email).toBe(200);
	});

	it("computes Markov Chain Removal Effects across conversion paths", () => {
		const journeys: ConversionJourney[] = [
			{
				id: "j1",
				touchpoints: [
					{ channel: "Paid Search", timestamp: 1 },
					{ channel: "Email", timestamp: 2 },
				],
				converted: true,
				revenue: 100,
			},
			{
				id: "j2",
				touchpoints: [{ channel: "Paid Search", timestamp: 1 }],
				converted: true,
				revenue: 50,
			},
		];

		const weights = AttributionEngine.calculateMarkovRemovalEffects(journeys);
		expect(weights["Paid Search"]).toBeGreaterThan(0);
		expect(weights.Email).toBeGreaterThan(0);
		// Paid Search was in both converting journeys, so its removal impact is higher
		expect(weights["Paid Search"]).toBeGreaterThanOrEqual(weights.Email ?? 0);
	});

	it("computes Shapley Value cooperative game theory weights", () => {
		const journeys: ConversionJourney[] = [
			{
				id: "j1",
				touchpoints: [
					{ channel: "Search", timestamp: 1 },
					{ channel: "Display", timestamp: 2 },
				],
				converted: true,
				revenue: 300,
			},
		];

		const weights = AttributionEngine.calculateShapleyAttribution(journeys);
		expect(weights.Search).toBeGreaterThan(0);
		expect(weights.Display).toBeGreaterThan(0);
	});

	it("evaluates custom audiences and fires audience triggers", () => {
		const engine = new AudienceEngine(false);

		engine.registerAudience({
			id: "aud_vip",
			name: "VIP Spenders",
			conditions: [
				{
					parameter: "loyalty_tier",
					operator: "EQUALS",
					targetValue: "Gold",
					scope: "USER",
				},
			],
			membershipDurationDays: 30,
			audienceTriggerEventName: "vip_status_achieved",
		});

		const user = {
			userId: "usr_100",
			lifetimePurchases: 5,
			lifetimeRevenue: 500,
			daysActiveLast28Days: 14,
			lastActiveDaysAgo: 1,
			parameters: { loyalty_tier: "Gold" },
		};

		const result1 = engine.evaluateUser(user);
		expect(result1.joinedAudiences).toContain("aud_vip");
		expect(result1.triggeredEvents).toContain("vip_status_achieved");

		// Second evaluation should not re-fire trigger if already a member
		const result2 = engine.evaluateUser(user);
		expect(result2.joinedAudiences.length).toBe(0);
		expect(result2.triggeredEvents.length).toBe(0);
	});

	it("computes predictive machine learning metrics", () => {
		const engine = new AudienceEngine();
		const activeUser = {
			userId: "usr_active",
			lifetimePurchases: 6,
			lifetimeRevenue: 800,
			daysActiveLast28Days: 20,
			lastActiveDaysAgo: 1,
			parameters: {},
		};

		const metrics = engine.calculatePredictiveMetrics(activeUser);
		expect(metrics.purchaseProbability).toBeGreaterThan(0.5);
		expect(metrics.churnProbability).toBeLessThan(0.3);
		expect(metrics.predicted28DayRevenue).toBeGreaterThan(0);
	});
});
