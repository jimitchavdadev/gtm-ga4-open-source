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

	const steps = [
		{ name: "View Item", event: "view_item" },
		{ name: "Add to Cart", event: "add_to_cart" },
		{ name: "Begin Checkout", event: "begin_checkout" },
		{ name: "Purchase", event: "purchase" },
	];

	const counts = steps.map((s) => ({
		step: s.name,
		users: new Set(
			events
				.filter((e) => e.event_name === s.event || e.event_name === "page_view")
				.map((e) => e.client_id),
		).size,
	}));

	return Response.json(
		{ propertyId: id, funnel: counts },
		{ headers: corsHeaders },
	);
}
