import { describe, expect, it } from "bun:test";
import { ApprovalEngine } from "../src/gtm-enterprise/approval-engine";
import { EnvironmentManager } from "../src/gtm-enterprise/environments";
import { ZoneEngine } from "../src/gtm-enterprise/zone-engine";

describe("GTM 360 Enterprise Features (Module 4)", () => {
	it("enforces Container Zones with boundaries and tag type restrictions", () => {
		const zoneEngine = new ZoneEngine();

		zoneEngine.registerZone({
			id: "zone_eu",
			name: "EU Regional Marketing",
			childContainerPublicId: "GTM-EU100",
			boundaryCondition: (url) => url.includes("/es/") || url.includes("/fr/"),
			typeRestriction: {
				mode: "ALLOWLIST",
				tagTypes: ["ga4_event", "google_ads"],
			},
		});

		// Check boundary condition
		const active1 = zoneEngine.getActiveZones("https://brand.com/us/shop");
		expect(active1.length).toBe(0);

		const active2 = zoneEngine.getActiveZones("https://brand.com/es/shop");
		expect(active2.length).toBe(1);
		expect(active2[0]?.childContainerPublicId).toBe("GTM-EU100");

		// Check type restrictions
		expect(zoneEngine.isTagTypeAllowedInZone("zone_eu", "ga4_event")).toBe(
			true,
		);
		expect(zoneEngine.isTagTypeAllowedInZone("zone_eu", "custom_html")).toBe(
			false,
		);
	});

	it("manages multi-stage approval workflows with inline comments", () => {
		const approval = new ApprovalEngine();
		const req = approval.submitForApproval(
			"ws_123",
			"analyst@company.com",
			"Ready for production release with consent v2",
		);

		expect(req.status).toBe("PENDING");
		expect(req.notes).toBe("Ready for production release with consent v2");

		// In-line comment during audit
		const comment = approval.addComment(
			req.id,
			"auditor@company.com",
			"GA4 Purchase Tag",
			"Please ensure transaction_id is non-nullable",
		);
		expect(comment.author).toBe("auditor@company.com");

		// Approve request
		const reviewed = approval.reviewRequest(
			req.id,
			"auditor@company.com",
			"APPROVE",
		);
		expect(reviewed.status).toBe("APPROVED");
		expect(reviewed.reviewedBy).toBe("auditor@company.com");
	});

	it("generates authenticated environment snippets", () => {
		const envMgr = new EnvironmentManager();
		const live = envMgr.createEnvironment("GTM-PROD01", "Production", "LIVE");
		const staging = envMgr.createEnvironment("GTM-PROD01", "Staging", "USER");

		const liveSnippet = envMgr.generateSnippetUrl(live.id);
		expect(liveSnippet).toBe("https://metrics.brand.com/gtm.js?id=GTM-PROD01");

		const stagingSnippet = envMgr.generateSnippetUrl(staging.id);
		expect(stagingSnippet).toContain("&gtm_auth=");
		expect(stagingSnippet).toContain("&gtm_preview=env_staging");

		expect(envMgr.validateAuth(staging.id, staging.authToken)).toBe(true);
		expect(envMgr.validateAuth(staging.id, "invalid_token")).toBe(false);
	});
});
