import { entityRepo } from "@/src/db/instance";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const body = (await req.json().catch(() => null)) as any;
	const entities = entityRepo.getEntities(id);
	const containerId = body?.container_id || "default_container";
	const version = entityRepo.createVersion(
		containerId,
		body?.name || `Version ${Date.now()}`,
		body?.description || "Published via GTM UI",
		JSON.stringify(entities),
	);
	return Response.json(version, { status: 201, headers: corsHeaders });
}
