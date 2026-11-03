import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { DatabaseManager } from "../src/db/connection";
import { EventRepository } from "../src/db/event-repository";
import { AnalyticsRepository } from "../src/db/repository";
import { createAnalyticsServer } from "../src/server/http-server";

describe("Self-Hosted HTTP Ingestion Server & APIs (Module 10)", () => {
	let dbManager: DatabaseManager;
	let eventRepo: EventRepository;
	let analyticsRepo: AnalyticsRepository;
	let server: any;
	const PORT = 9876;
	const BASE_URL = `http://localhost:${PORT}`;

	beforeAll(() => {
		dbManager = new DatabaseManager(":memory:");
		const db = dbManager.getDb();
		analyticsRepo = new AnalyticsRepository(db);
		eventRepo = new EventRepository(db);

		// Seed initial account, property, and data stream
		analyticsRepo.createAccount({
			id: "acc_1",
			name: "Main Account",
			share_data: 0,
		});
		eventRepo.createProperty({
			id: "prop_1",
			account_id: "acc_1",
			display_name: "Web Store",
			is_360: 1,
			data_retention_months: 14,
		});
		eventRepo.createDataStream({
			id: "str_1",
			property_id: "prop_1",
			stream_type: "WEB",
			display_name: "Web Stream",
			measurement_id: "G-TESTSTREAM",
			api_secret: "secret_123",
			config_json: JSON.stringify({}),
		});

		server = createAnalyticsServer({
			port: PORT,
			hostname: "127.0.0.1",
			eventRepo,
		});
	});

	afterAll(() => {
		server?.stop();
		dbManager.close();
	});

	it("serves healthz endpoint", async () => {
		const res = await fetch(`${BASE_URL}/healthz`);
		expect(res.status).toBe(200);
		const json = (await res.json()) as any;
		expect(json.status).toBe("ok");
	});

	it("serves GTM container script with correct headers", async () => {
		const res = await fetch(`${BASE_URL}/gtm.js?id=GTM-ABC123`);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("application/javascript");
		const text = await res.text();
		expect(text).toContain("GTM-ABC123");
	});

	it("ingests /g/collect wire hits and persists sanitized event", async () => {
		const collectUrl =
			`${BASE_URL}/g/collect?v=2&tid=G-TESTSTREAM&cid=client.555&en=page_view` +
			`&dl=https%3A%2F%2Fexample.com%2Fshop%3Ftoken%3Dsecret123%26email%3Djane%40domain.com`;

		const res = await fetch(collectUrl, { method: "POST" });
		expect(res.status).toBe(204);

		const events = eventRepo.getRecentEvents("prop_1", 10);
		expect(events.length).toBeGreaterThan(0);
		const latest = events[0];
		expect(latest).toBeDefined();
		if (!latest) throw new Error("Expected event");
		expect(latest.client_id).toBe("client.555");
		expect(latest.event_name).toBe("page_view");

		const params = JSON.parse(latest.event_params_json);
		expect(params.page_location).not.toContain("token=secret123");
		expect(params.page_location).toContain("email=(redacted)");
	});

	it("validates Measurement Protocol payloads via /debug/mp/collect", async () => {
		const res = await fetch(
			`${BASE_URL}/debug/mp/collect?api_secret=sec&measurement_id=BAD_ID`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ events: [{ name: "purchase" }] }),
			},
		);

		expect(res.status).toBe(200);
		const data = (await res.json()) as any;
		expect(data.validationMessages.length).toBeGreaterThan(0);
	});

	it("ingests Measurement Protocol conversions and queries realtime API", async () => {
		const res = await fetch(
			`${BASE_URL}/mp/collect?api_secret=secret_123&measurement_id=G-TESTSTREAM`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					client_id: "client.999",
					user_id: "user.vip",
					events: [
						{
							name: "purchase",
							params: { value: 129.5, currency: "USD", session_id: 12345 },
						},
					],
				}),
			},
		);

		expect(res.status).toBe(204);

		// Query realtime API
		const realtimeRes = await fetch(
			`${BASE_URL}/api/v1/properties/prop_1/realtime`,
		);
		expect(realtimeRes.status).toBe(200);
		const realtimeJson = (await realtimeRes.json()) as any;
		expect(realtimeJson.propertyId).toBe("prop_1");
		expect(realtimeJson.activeUsersLast30Min).toBeGreaterThanOrEqual(2);
		expect(realtimeJson.eventCount).toBeGreaterThanOrEqual(2);

		const purchaseEvent = realtimeJson.events.find(
			(e: any) => e.event_name === "purchase",
		);
		expect(purchaseEvent).toBeDefined();
		expect(purchaseEvent.is_conversion).toBe(1);
	});
});
