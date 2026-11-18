import { describe, expect, it } from "bun:test";
import { GET as getTrackerScript } from "../app/tracker.js/route";
import { proxyToRust } from "../src/server/rust-proxy";

describe("First-Party Custom Platform Endpoints", () => {
	it("serves custom /tracker.js container script", async () => {
		const req = new Request(
			"http://localhost:3000/tracker.js?id=GTM-CUSTOM123",
		);
		const res = await getTrackerScript(req);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("GTM-CUSTOM123");
	});

	it("ingests hits via custom /api/events/collect endpoint", async () => {
		const req = new Request(
			"http://localhost:3000/api/events/collect?v=2&tid=G-TESTSTREAM&cid=user_cust_1&en=page_view",
			{ method: "POST" },
		);
		const res = await proxyToRust(req, "/api/events/collect");
		expect(res.status).toBe(204);
	});

	it("ingests batch conversions via custom /api/events/batch endpoint", async () => {
		const req = new Request(
			"http://localhost:3000/api/events/batch?api_secret=sec_123&measurement_id=G-TESTSTREAM",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					client_id: "user_cust_2",
					events: [
						{ name: "purchase", params: { value: 120.0, currency: "USD" } },
					],
				}),
			},
		);
		const res = await proxyToRust(req, "/api/events/batch");
		expect(res.status).toBe(204);
	});

	it("validates payloads via custom /api/events/validate endpoint", async () => {
		const req = new Request(
			"http://localhost:3000/api/events/validate?api_secret=sec_123&measurement_id=G-TESTSTREAM",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					client_id: "user_cust_3",
					events: [{ name: "page_view" }],
				}),
			},
		);
		const res = await proxyToRust(req, "/api/events/validate");
		expect(res.status).toBe(200);
	});

	it("queries custom /api/analytics/properties/[id]/realtime", async () => {
		const req = new Request(
			"http://localhost:3000/api/analytics/properties/prop_1/realtime",
		);
		const res = await proxyToRust(
			req,
			"/api/analytics/properties/prop_1/realtime",
		);
		expect(res.status).toBe(200);
		const json = (await res.json()) as any;
		expect(json.propertyId).toBe("prop_1");
		expect(json.activeUsersLast30Min).toBeDefined();
	});

	it("manages entities via custom /api/tag-manager/workspaces/[id]/entities", async () => {
		const req = new Request(
			"http://localhost:3000/api/tag-manager/workspaces/ws_default/entities",
		);
		const res = await proxyToRust(
			req,
			"/api/v1/workspaces/ws_default/entities",
		);
		expect(res.status).toBe(200);
		const list = (await res.json()) as any[];
		expect(Array.isArray(list)).toBe(true);
	});
});
