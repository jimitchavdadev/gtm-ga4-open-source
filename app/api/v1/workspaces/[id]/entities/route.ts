import { entityRepo } from "@/src/db/instance";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const url = new URL(req.url);
	const type = url.searchParams.get("type") || undefined;
	const list = entityRepo.getEntities(id, type);
	return Response.json(list, { headers: corsHeaders });
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const body = (await req.json().catch(() => null)) as any;

	if (!body?.name || !body?.entity_type) {
		return Response.json(
			{ error: "name and entity_type are required" },
			{ status: 400, headers: corsHeaders },
		);
	}

	const entity = entityRepo.createEntity({
		id: `ent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
		workspace_id: id,
		entity_type: body.entity_type,
		name: body.name,
		data_json: JSON.stringify(body.data || {}),
		fingerprint: Math.random().toString(36).substring(2, 10),
	});

	return Response.json(entity, { status: 201, headers: corsHeaders });
}
