import { describe, expect, it } from "bun:test";
import { DataRedactionEngine } from "../src/ga4/data-redaction";
import { MeasurementProtocolValidator } from "../src/ga4/measurement-protocol";
import { PropertyHierarchyEngine } from "../src/ga4/subproperties";
import type { Ga4Event } from "../src/ga4/types";

describe("GA4 Enterprise Hierarchy, Data Redaction & Measurement Protocol (Module 9)", () => {
	it("manages subproperties and roll-up properties under 360 tier", () => {
		const engine = new PropertyHierarchyEngine();

		// Free tier rejected
		expect(() =>
			engine.registerSubproperty("FREE", {
				id: "sub_us",
				sourcePropertyId: "prop_main",
				name: "US Traffic",
				filterRules: [
					{ field: "params.country", operator: "EQUALS", value: "US" },
				],
			}),
		).toThrow("GA4 360 Enterprise tier");

		// 360 tier accepted
		engine.registerSubproperty("360", {
			id: "sub_us",
			sourcePropertyId: "prop_main",
			name: "US Traffic",
			filterRules: [
				{ field: "params.country", operator: "EQUALS", value: "US" },
			],
		});

		engine.registerRollup("360", {
			id: "rollup_global",
			name: "Global Rollup",
			sourcePropertyIds: ["prop_main", "prop_eu"],
		});

		const usEvent: Ga4Event = {
			id: "ev_1",
			name: "page_view",
			clientId: "c_1",
			params: { country: "US", page_location: "https://example.com/us" },
			timestampMicros: Date.now() * 1000,
		};

		const euEvent: Ga4Event = {
			id: "ev_2",
			name: "page_view",
			clientId: "c_2",
			params: { country: "DE", page_location: "https://example.com/de" },
			timestampMicros: Date.now() * 1000,
		};

		const routedSub = engine.routeSubproperties("prop_main", usEvent);
		expect(routedSub).toEqual(["sub_us"]);

		const nonMatchedSub = engine.routeSubproperties("prop_main", euEvent);
		expect(nonMatchedSub).toEqual([]);

		const rollupHits = engine.routeRollups("prop_main", usEvent);
		expect(rollupHits.length).toBe(1);
		expect(rollupHits[0]?.rollupId).toBe("rollup_global");
		expect(rollupHits[0]?.rollupEvent.params._source_property_id).toBe(
			"prop_main",
		);
	});

	it("redacts emails and strips sensitive query parameters", () => {
		const rawUrl =
			"https://example.com/checkout?token=secret123&user_email=john.doe@domain.com&plan=pro";

		const sanitizedUrl = DataRedactionEngine.redactUrl(rawUrl, ["token"], true);
		expect(sanitizedUrl).not.toContain("token=secret123");
		expect(sanitizedUrl).toContain("user_email=(redacted)");
		expect(sanitizedUrl).toContain("plan=pro");

		const params = {
			page_location: "https://store.com/order?auth=xyz&ref=alice%40corp.net",
			user_note: "Please contact support@company.org for assistance",
			items_count: 5,
		};

		const sanitizedParams = DataRedactionEngine.sanitizeEventParams(params, {
			redactEmail: true,
			stripQueryParameters: ["auth"],
		});

		expect(sanitizedParams.page_location).not.toContain("auth=xyz");
		expect(sanitizedParams.page_location).toContain("ref=(redacted)");
		expect(sanitizedParams.user_note).toBe(
			"Please contact (redacted) for assistance",
		);
		expect(sanitizedParams.items_count).toBe(5);
	});

	it("validates Measurement Protocol payloads with standard GA4 error diagnostics", () => {
		// Missing secret and bad ID
		const badQueryRes = MeasurementProtocolValidator.validate(
			{ api_secret: "", measurement_id: "BAD_ID" },
			{ client_id: "123.456", events: [{ name: "purchase" }] },
		);
		expect(badQueryRes.valid).toBe(false);
		expect(
			badQueryRes.validationMessages.some((m) => m.fieldPath === "api_secret"),
		).toBe(true);
		expect(
			badQueryRes.validationMessages.some(
				(m) => m.fieldPath === "measurement_id",
			),
		).toBe(true);

		// Reserved event name and reserved param
		const reservedRes = MeasurementProtocolValidator.validate(
			{ api_secret: "secret_abc", measurement_id: "G-12345ABC" },
			{
				client_id: "123.456",
				events: [{ name: "ga_custom_event", params: { google_param: 1 } }],
			},
		);
		expect(reservedRes.valid).toBe(false);
		expect(
			reservedRes.validationMessages.some(
				(m) => m.validationCode === "NAME_RESERVED",
			),
		).toBe(true);
		expect(
			reservedRes.validationMessages.some(
				(m) => m.validationCode === "PARAM_NAME_RESERVED",
			),
		).toBe(true);

		// Valid payload creates canonical Ga4Events
		const validRes = MeasurementProtocolValidator.validate(
			{ api_secret: "secret_abc", measurement_id: "G-12345ABC" },
			{
				client_id: "client_999",
				user_id: "user_777",
				events: [
					{
						name: "purchase",
						params: { currency: "USD", value: 49.99, session_id: "sess_1" },
					},
				],
			},
		);

		expect(validRes.valid).toBe(true);
		expect(validRes.canonicalEvents?.length).toBe(1);
		expect(validRes.canonicalEvents?.[0]?.clientId).toBe("client_999");
		expect(validRes.canonicalEvents?.[0]?.userId).toBe("user_777");
		expect(validRes.canonicalEvents?.[0]?.params.ga_session_id).toBe("sess_1");
	});
});
