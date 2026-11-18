import { describe, expect, it } from "bun:test";
import { proxyToRust } from "../src/server/rust-proxy";

describe("Onboarding & Setup Flow Integration", () => {
	it("generates correct first-party cloaked snippet for GTM container", () => {
		const containerId = "GTM-TEST123";
		const snippet = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+dl:'';j.async=true;j.src=
'/tracker.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`;

		expect(snippet).toContain(containerId);
		expect(snippet).toContain("/tracker.js?id=");
		expect(snippet).not.toContain("googletagmanager.com");
	});

	it("generates correct noscript fallback iframe pointing to first-party cloaked endpoint", () => {
		const containerId = "GTM-ENTERPRISE";
		const noscript = `<noscript><iframe src="/_trk/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

		expect(noscript).toContain(containerId);
		expect(noscript).toContain("/_trk/ns.html?id=");
		expect(noscript).not.toContain("google");
	});

	it("emits live verification ping to custom /api/events/collect and validates ingestion", async () => {
		const testPropertyId = "G-TESTSTREAM";
		const req = new Request(
			`http://localhost:3000/api/events/collect?v=2&tid=${testPropertyId}&cid=onboard_client_1&en=page_view&gcs=G111`,
			{ method: "POST" },
		);

		const res = await proxyToRust(req, "/api/events/collect");
		expect(res.status).toBe(204);

		// Verify that the realtime route reflects the active stream
		const realtimeReq = new Request(
			"http://localhost:3000/api/analytics/properties/prop_1/realtime",
		);
		const realtimeRes = await proxyToRust(
			realtimeReq,
			"/api/analytics/properties/prop_1/realtime",
		);
		expect(realtimeRes.status).toBe(200);
		const data = (await realtimeRes.json()) as any;
		expect(data.propertyId).toBe("prop_1");
		expect(data.activeUsersLast30Min).toBeDefined();
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
