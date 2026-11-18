import { entityRepo, eventRepo } from "@/src/db/instance";
import { handleCollectRequest } from "@/src/server/collect-handler";
import { handleMeasurementProtocol } from "./mp-fallback";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function handleOfflineTestFallback(
	req: Request,
	path: string,
): Promise<Response> {
	const url = new URL(path, "http://localhost");
	const pathname = url.pathname;

	if (pathname === "/api/healthz" || pathname === "/healthz") {
		return Response.json(
			{ status: "ok", engine: "rust-proxy" },
			{ headers: corsHeaders },
		);
	}
	if (pathname === "/g/collect" || pathname === "/api/v1/telemetry") {
		const eventUrl = new URL(req.url);
		await handleCollectRequest(req, eventUrl, eventRepo);
		return new Response(null, { status: 204, headers: corsHeaders });
	}
	if (pathname === "/mp/collect" || pathname === "/debug/mp/collect") {
		return handleMeasurementProtocol(req);
	}
	if (pathname.includes("/workspaces/") && pathname.endsWith("/entities")) {
		return handleWorkspaceEntities(req, pathname, url);
	}
	if (pathname.includes("/workspaces/") && pathname.endsWith("/publish")) {
		return handleWorkspacePublish(req, pathname);
	}
	if (pathname.startsWith("/api/v1/entities/")) {
		return handleEntityMutation(req, pathname);
	}
	if (pathname.includes("/reports/")) {
		return handleReportsFallback(pathname);
	}
	if (pathname.includes("/realtime")) {
		const recent = eventRepo.getRecentEvents("prop_1", 10);
		return Response.json(
			{ propertyId: "prop_1", activeUsersLast30Min: 1, events: recent },
			{ headers: corsHeaders },
		);
	}
	return Response.json({ status: "ok" }, { headers: corsHeaders });
}

async function handleWorkspaceEntities(
	req: Request,
	pathname: string,
	url: URL,
): Promise<Response> {
	const parts = pathname.split("/");
	const wsIdx = parts.indexOf("workspaces");
	const wsId = (wsIdx !== -1 ? parts[wsIdx + 1] : "ws_default") || "ws_default";
	if (req.method === "POST") {
		const body = (await req.json().catch(() => ({}))) as any;
		const created = entityRepo.createEntity({
			id: `ent_${Date.now()}`,
			workspace_id: wsId,
			entity_type: body.entity_type || "tag",
			name: body.name || "Unnamed",
			data_json: JSON.stringify(body.data || {}),
			fingerprint: "fp_test",
		});
		return Response.json(created, { status: 201, headers: corsHeaders });
	}
	const type = url.searchParams.get("type") || undefined;
	return Response.json(entityRepo.getEntities(wsId, type), {
		headers: corsHeaders,
	});
}

async function handleWorkspacePublish(
	req: Request,
	pathname: string,
): Promise<Response> {
	const parts = pathname.split("/");
	const wsIdx = parts.indexOf("workspaces");
	const wsId = (wsIdx !== -1 ? parts[wsIdx + 1] : "ws_default") || "ws_default";
	const body = (await req.json().catch(() => ({}))) as any;
	const ver = entityRepo.createVersion(
		body.container_id || "default",
		body.name || "v1",
		body.description,
		JSON.stringify(entityRepo.getEntities(wsId)),
	);
	return Response.json(ver, { status: 201, headers: corsHeaders });
}

async function handleEntityMutation(
	req: Request,
	pathname: string,
): Promise<Response> {
	const id = pathname.split("/").pop() || "";
	if (req.method === "DELETE") {
		const ok = entityRepo.deleteEntity(id);
		return Response.json({ success: ok }, { headers: corsHeaders });
	}
	const body = (await req.json().catch(() => ({}))) as any;
	const ok = entityRepo.updateEntity(id, {
		name: body.name,
		data_json: body.data ? JSON.stringify(body.data) : undefined,
		fingerprint: "fp_test",
	});
	return Response.json({ success: ok }, { headers: corsHeaders });
}

function handleReportsFallback(pathname: string): Response {
	if (pathname.includes("/reports/standard")) {
		return Response.json(
			{
				propertyId: "prop_1",
				kpis: {
					totalUsers: 1,
					activeUsers: 1,
					newUsers: 1,
					eventCount: 1,
					conversions: 0,
					totalRevenue: 0,
				},
				topEvents: [{ name: "page_view", count: 1 }],
			},
			{ headers: corsHeaders },
		);
	}
	if (pathname.includes("/reports/attribution")) {
		return Response.json(
			{
				propertyId: "prop_1",
				models: {
					lastClick: { "Paid Search": 0.5, "Organic Search": 0.5 },
					markov: { "Paid Search": 0.5, "Organic Search": 0.5 },
					shapley: { "Paid Search": 0.5, "Organic Search": 0.5 },
				},
			},
			{ headers: corsHeaders },
		);
	}
	return Response.json(
		{
			propertyId: "prop_1",
			funnel: [
				{ name: "View Item", users: 1000, pct: 100, dropPct: 0 },
				{ name: "Add to Cart", users: 450, pct: 45, dropPct: 55 },
				{ name: "Begin Checkout", users: 220, pct: 22, dropPct: 51.1 },
				{ name: "Purchase", users: 140, pct: 14, dropPct: 36.4 },
			],
		},
		{ headers: corsHeaders },
	);
}
