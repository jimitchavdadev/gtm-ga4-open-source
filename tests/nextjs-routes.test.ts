import { beforeAll, describe, expect, it } from "bun:test";
import { GET as getHealthz } from "../app/api/healthz/route";
import {
	DELETE as deleteEntity,
	PUT as updateEntity,
} from "../app/api/v1/entities/[id]/route";
import { GET as getAttribution } from "../app/api/v1/properties/[id]/reports/attribution/route";
import { GET as getFunnel } from "../app/api/v1/properties/[id]/reports/funnel/route";
import { GET as getStandard } from "../app/api/v1/properties/[id]/reports/standard/route";
import {
	GET as getEntities,
	POST as postEntity,
} from "../app/api/v1/workspaces/[id]/entities/route";
import { POST as publishWorkspace } from "../app/api/v1/workspaces/[id]/publish/route";
import { POST as postCollect } from "../app/g/collect/route";
import { GET as getGtmScript } from "../app/gtm.js/route";
import { POST as postMp } from "../app/mp/collect/route";
import { analyticsRepo } from "../src/db/instance";

describe("Next.js App Router Route Handlers", () => {
	beforeAll(() => {
		analyticsRepo.createContainer({
			id: "GTM-TESTCONTAINER",
			account_id: "acc_1",
			name: "Test Container",
			public_id: "GTM-TESTCONTAINER",
			usage_context: "WEB",
			is_360: 1,
		});
		analyticsRepo.createWorkspace({
			id: "ws_test",
			container_id: "GTM-TESTCONTAINER",
			name: "Test Workspace",
			is_default: 1,
		});
	});

	it("handles /api/healthz", async () => {
		const res = await getHealthz();
		expect(res.status).toBe(200);
		const json = (await res.json()) as any;
		expect(json.status).toBe("ok");
	});

	it("serves /gtm.js container script", async () => {
		const req = new Request("http://localhost:3000/gtm.js?id=GTM-NEXT123");
		const res = await getGtmScript(req);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("GTM-NEXT123");
	});

	it("ingests /g/collect wire hits", async () => {
		const req = new Request(
			"http://localhost:3000/g/collect?v=2&tid=G-TESTSTREAM&cid=c_next_1&en=page_view&dl=https%3A%2F%2Fsite.com%2Fshop",
			{ method: "POST" },
		);
		const res = await postCollect(req);
		expect(res.status).toBe(204);
	});

	it("ingests /mp/collect conversions", async () => {
		const req = new Request(
			"http://localhost:3000/mp/collect?api_secret=sec_123&measurement_id=G-TESTSTREAM",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					client_id: "c_next_2",
					events: [
						{ name: "purchase", params: { value: 149.0, currency: "USD" } },
					],
				}),
			},
		);
		const res = await postMp(req);
		expect(res.status).toBe(204);
	});

	it("manages entities via /api/v1/workspaces/[id]/entities and /api/v1/entities/[id]", async () => {
		// Create tag
		const createReq = new Request(
			"http://localhost:3000/api/v1/workspaces/ws_test/entities",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Next.js Purchase Tag",
					entity_type: "TAG",
					data: { type: "GA4_EVENT", triggerName: "purchase" },
				}),
			},
		);
		const createRes = await postEntity(createReq, {
			params: Promise.resolve({ id: "ws_test" }),
		});
		expect(createRes.status).toBe(201);
		const createdTag = (await createRes.json()) as any;
		expect(createdTag.name).toBe("Next.js Purchase Tag");

		// List entities
		const listReq = new Request(
			"http://localhost:3000/api/v1/workspaces/ws_test/entities?type=TAG",
		);
		const listRes = await getEntities(listReq, {
			params: Promise.resolve({ id: "ws_test" }),
		});
		expect(listRes.status).toBe(200);
		const list = (await listRes.json()) as any[];
		expect(list.some((e) => e.id === createdTag.id)).toBe(true);

		// Update entity
		const updateReq = new Request(
			`http://localhost:3000/api/v1/entities/${createdTag.id}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "Updated Purchase Tag" }),
			},
		);
		const updateRes = await updateEntity(updateReq, {
			params: Promise.resolve({ id: createdTag.id }),
		});
		expect(updateRes.status).toBe(200);

		// Delete entity
		const deleteReq = new Request(
			`http://localhost:3000/api/v1/entities/${createdTag.id}`,
			{ method: "DELETE" },
		);
		const deleteRes = await deleteEntity(deleteReq, {
			params: Promise.resolve({ id: createdTag.id }),
		});
		expect(deleteRes.status).toBe(200);
	});

	it("publishes versions via /api/v1/workspaces/[id]/publish", async () => {
		const req = new Request(
			"http://localhost:3000/api/v1/workspaces/ws_test/publish",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					container_id: "GTM-TESTCONTAINER",
					name: "Release v1.0",
					description: "Initial container version",
				}),
			},
		);
		const res = await publishWorkspace(req, {
			params: Promise.resolve({ id: "ws_test" }),
		});
		expect(res.status).toBe(201);
		const version = (await res.json()) as any;
		expect(version.name).toBe("Release v1.0");
	});

	it("generates standard, attribution, and funnel reports", async () => {
		const req = new Request("http://localhost:3000");

		const stdRes = await getStandard(req, {
			params: Promise.resolve({ id: "prop_1" }),
		});
		expect(stdRes.status).toBe(200);
		const stdJson = (await stdRes.json()) as any;
		expect(stdJson.kpis).toBeDefined();

		const attrRes = await getAttribution(req, {
			params: Promise.resolve({ id: "prop_1" }),
		});
		expect(attrRes.status).toBe(200);
		const attrJson = (await attrRes.json()) as any;
		expect(attrJson.models).toBeDefined();

		const funnelRes = await getFunnel(req, {
			params: Promise.resolve({ id: "prop_1" }),
		});
		expect(funnelRes.status).toBe(200);
		const funnelJson = (await funnelRes.json()) as any;
		expect(funnelJson.funnel.length).toBe(4);
	});
});
