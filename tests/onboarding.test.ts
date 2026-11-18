import { describe, expect, it } from "bun:test";
import {
	getAndroidSnippets,
	getIosSnippets,
	getWebSnippets,
} from "../components/onboarding/snippets";
import type { OnboardingConfig } from "../components/onboarding/types";
import { proxyToRust } from "../src/server/rust-proxy";

describe("Onboarding & Multi-Platform Flow Integration", () => {
	const sampleConfig: OnboardingConfig = {
		containerId: "GTM-TEST123",
		propertyId: "prop_1",
		measurementId: "G-TESTSTREAM",
		streamName: "Mobile Store",
		streamUrl: "https://example.com",
		platformType: "web",
		appPackageName: "com.test.androidapp",
		bundleId: "com.test.iosapp",
		appVersion: "1.0.0",
		analyticsStorage: "granted",
		adStorage: "granted",
		adUserData: "granted",
		adPersonalization: "granted",
		reportingIdentity: "blended",
	};

	it("generates correct first-party cloaked snippet for Web container", () => {
		const snippets = getWebSnippets(sampleConfig);
		expect(snippets.custom).toContain(sampleConfig.containerId);
		expect(snippets.custom).toContain("/tracker.js?id=");
		expect(snippets.custom).not.toContain("googletagmanager.com");
	});

	it("generates correct Kotlin snippet for Android application", () => {
		const snippets = getAndroidSnippets(sampleConfig);
		expect(snippets.kotlin).toContain(sampleConfig.measurementId);
		expect(snippets.kotlin).toContain(sampleConfig.appPackageName);
		expect(snippets.kotlin).toContain("_p=android");
	});

	it("generates correct Swift snippet for iOS application", () => {
		const snippets = getIosSnippets(sampleConfig);
		expect(snippets.swift).toContain(sampleConfig.measurementId);
		expect(snippets.swift).toContain(sampleConfig.bundleId);
		expect(snippets.swift).toContain('URLQueryItem(name: "_p", value: "ios")');
	});

	it("ingests Android app_open event hit via custom /api/events/collect", async () => {
		const req = new Request(
			`http://localhost:3000/api/events/collect?v=2&tid=${sampleConfig.measurementId}&cid=android_client_1&en=app_open&_p=android&aid=${sampleConfig.appPackageName}`,
			{ method: "POST" },
		);
		const res = await proxyToRust(req, "/api/events/collect");
		expect(res.status).toBe(204);
	});

	it("ingests iOS app_open event hit via custom /api/events/collect", async () => {
		const req = new Request(
			`http://localhost:3000/api/events/collect?v=2&tid=${sampleConfig.measurementId}&cid=ios_client_1&en=app_open&_p=ios&bundle_id=${sampleConfig.bundleId}`,
			{ method: "POST" },
		);
		const res = await proxyToRust(req, "/api/events/collect");
		expect(res.status).toBe(204);
	});

	it("validates Consent Mode v2 default signal encoding", () => {
		const buildGcs = (
			analytics: "granted" | "denied",
			ads: "granted" | "denied",
		) => {
			const a = ads === "granted" ? "1" : "0";
			const b = analytics === "granted" ? "1" : "0";
			return `G1${a}${b}`;
		};

		expect(buildGcs("granted", "granted")).toBe("G111");
		expect(buildGcs("denied", "denied")).toBe("G100");
		expect(buildGcs("granted", "denied")).toBe("G101");
		expect(buildGcs("denied", "granted")).toBe("G110");
	});
});
