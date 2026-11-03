import { dbManager } from "@/src/db/instance";
import { AttributionEngine } from "@/src/ga4/attribution";

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
		.prepare(
			"SELECT * FROM raw_events WHERE property_id = ? ORDER BY timestamp_micros ASC",
		)
		.all(id) as any[];

	const journeysMap = new Map<string, any[]>();
	for (const e of events) {
		let j = journeysMap.get(e.client_id);
		if (!j) {
			j = [];
			journeysMap.set(e.client_id, j);
		}
		j.push(e);
	}

	const journeys = Array.from(journeysMap.entries()).map(([_cid, evs], idx) => {
		const touchpoints = evs.map((e) => {
			let channel = "Direct";
			try {
				const p = JSON.parse(e.event_params_json || "{}");
				channel =
					p.campaign ||
					p.source ||
					(e.event_name === "page_view" ? "Organic Search" : "Direct");
			} catch {}
			return { channel, timestamp: e.timestamp_micros };
		});
		const hasPurchase = evs.some((e) => e.event_name === "purchase");
		return {
			id: `j_${idx}`,
			touchpoints:
				touchpoints.length > 0
					? touchpoints
					: [{ channel: "Direct", timestamp: 1 }],
			converted: hasPurchase || evs.length > 2,
			revenue: hasPurchase ? 100 : 25,
		};
	});

	const lastClick = AttributionEngine.calculateLastClick(journeys);
	const markov = AttributionEngine.calculateMarkovRemovalEffects(journeys);
	const shapley = AttributionEngine.calculateShapleyAttribution(journeys);

	return Response.json(
		{
			propertyId: id,
			models: {
				lastClick,
				markovRemovalEffects: markov,
				shapleyValueDDA: shapley,
			},
		},
		{ headers: corsHeaders },
	);
}
