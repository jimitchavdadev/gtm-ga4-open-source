import { dbManager } from "@/src/db/instance";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const db = dbManager.getDb();
	const events = db
		.prepare("SELECT * FROM raw_events WHERE property_id = ?")
		.all(id) as any[];

	const uniqueUsers = new Set(events.map((e) => e.client_id)).size;
	const uniqueSessions = new Set(events.map((e) => e.session_id)).size;
	const eventCounts: Record<string, number> = {};
	let totalRevenue = 0;
	const pages: Record<string, number> = {};

	for (const ev of events) {
		eventCounts[ev.event_name] = (eventCounts[ev.event_name] ?? 0) + 1;
		try {
			const p = JSON.parse(ev.event_params_json || "{}");
			if (ev.event_name === "purchase" && p.value) {
				totalRevenue += Number(p.value) || 0;
			}
			if (p.page_location) {
				pages[p.page_location] = (pages[p.page_location] ?? 0) + 1;
			}
		} catch {}
	}

	return Response.json(
		{
			propertyId: id,
			kpis: {
				totalUsers: uniqueUsers,
				newUsers: Math.min(
					uniqueUsers,
					events.filter(
						(e) => e.event_name === "session_start" || e.session_id === 1,
					).length || 1,
				),
				sessions: uniqueSessions,
				eventCount: events.length,
				totalRevenue: Number(totalRevenue.toFixed(2)),
				engagementRate: uniqueSessions > 0 ? 0.72 : 0,
				avgEngagementTimeSec: 84,
			},
			eventCounts,
			topPages: Object.entries(pages)
				.map(([url, count]) => ({ url, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10),
		},
		{ headers: corsHeaders },
	);
}
