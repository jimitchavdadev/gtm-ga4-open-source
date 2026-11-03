import { beforeEach, describe, expect, it } from "bun:test";
import { ConsentManager } from "../src/gtm/consent-manager";
import { TagScheduler } from "../src/gtm/tag-scheduler";
import { TriggerEngine } from "../src/gtm/trigger-engine";
import type { TagConfig } from "../src/gtm/types";

describe("GTM Tag Orchestration & Consent Engine (Module 3)", () => {
	let triggerEngine: TriggerEngine;
	let consentManager: ConsentManager;
	let scheduler: TagScheduler;

	beforeEach(() => {
		triggerEngine = new TriggerEngine();
		consentManager = new ConsentManager();
		scheduler = new TagScheduler(triggerEngine, consentManager);
	});

	it("evaluates triggers and trigger groups with member history", () => {
		triggerEngine.registerTrigger({
			id: "trig_pv",
			name: "Pageview",
			eventName: "page_view",
			predicates: [
				{ variableName: "path", operator: "EQUALS", targetValue: "/home" },
			],
		});

		triggerEngine.registerTrigger({
			id: "trig_click",
			name: "CTA Click",
			eventName: "cta_click",
			predicates: [
				{ variableName: "button", operator: "EQUALS", targetValue: "signup" },
			],
		});

		const ctx1 = {
			eventName: "page_view",
			dataLayer: {},
			resolveVariable: (name: string) => (name === "path" ? "/home" : ""),
		};

		expect(triggerEngine.isTriggerQualified("trig_pv", ctx1)).toBe(true);

		const ctx2 = {
			eventName: "cta_click",
			dataLayer: {},
			resolveVariable: (name: string) => (name === "button" ? "signup" : ""),
		};

		// Trigger Group requiring both pageview and cta_click
		expect(
			triggerEngine.evaluateTriggerGroup(["trig_pv", "trig_click"], ctx2),
		).toBe(true);
	});

	it("encodes Consent Mode v2 gcs and gcd strings accurately", () => {
		consentManager.setDefault(
			{
				ad_storage: "denied",
				analytics_storage: "denied",
				ad_user_data: "denied",
				ad_personalization: "denied",
			},
			500,
		);

		expect(consentManager.encodeGcs()).toBe("G100");
		expect(consentManager.encodeGcd()).toBe("13p3p3p3p5");

		// User accepts cookies
		consentManager.setUpdate({
			ad_storage: "granted",
			analytics_storage: "granted",
			ad_user_data: "granted",
			ad_personalization: "granted",
		});

		expect(consentManager.encodeGcs()).toBe("G111");
		expect(consentManager.encodeGcd()).toBe("13r3r3r3r5");
	});

	it("enforces tag priority sorting, sequencing, and once-per-page frequency", async () => {
		const executionOrder: string[] = [];

		triggerEngine.registerTrigger({
			id: "trig_all",
			name: "All Events",
			predicates: [],
		});

		const setupTag: TagConfig = {
			id: "tag_setup",
			name: "Init SDK",
			type: "custom",
			firingTriggers: [],
			parameters: {},
		};

		const primaryTag: TagConfig = {
			id: "tag_primary",
			name: "Track Action",
			type: "custom",
			priority: 50,
			firingTriggers: ["trig_all"],
			setupTags: [{ tagId: "tag_setup", stopOnFailure: true }],
			teardownTags: [{ tagId: "tag_teardown" }],
			firingOption: "ONCE_PER_PAGE",
			parameters: {},
		};

		const teardownTag: TagConfig = {
			id: "tag_teardown",
			name: "Cleanup SDK",
			type: "custom",
			firingTriggers: [],
			parameters: {},
		};

		scheduler.registerTag(setupTag, async (t) => {
			executionOrder.push(t.name);
			return true;
		});

		scheduler.registerTag(primaryTag, async (t) => {
			executionOrder.push(t.name);
			return true;
		});

		scheduler.registerTag(teardownTag, async (t) => {
			executionOrder.push(t.name);
			return true;
		});

		const context = {
			eventName: "test_event",
			dataLayer: {},
			resolveVariable: () => "",
		};

		const records1 = await scheduler.processEvent(context);
		expect(records1[0]?.status).toBe("SUCCESS");
		expect(executionOrder).toEqual(["Init SDK", "Track Action", "Cleanup SDK"]);

		// Second firing should be skipped due to ONCE_PER_PAGE
		const records2 = await scheduler.processEvent(context);
		expect(records2[0]?.status).toBe("SKIPPED_ONCE_PER_PAGE");
	});

	it("blocks tag execution when required consent is denied", async () => {
		consentManager.setDefault({ analytics_storage: "denied" });

		triggerEngine.registerTrigger({
			id: "trig_event",
			name: "Evt",
			predicates: [],
		});

		const tag: TagConfig = {
			id: "tag_ga4",
			name: "GA4 Hit",
			type: "custom",
			firingTriggers: ["trig_event"],
			parameters: { requiredConsent: "analytics_storage" },
		};

		let executed = false;
		scheduler.registerTag(tag, () => {
			executed = true;
			return true;
		});

		const records = await scheduler.processEvent({
			eventName: "evt",
			dataLayer: {},
			resolveVariable: () => "",
		});

		expect(records[0]?.status).toBe("FAILED");
		expect(executed).toBe(false);
	});
});
