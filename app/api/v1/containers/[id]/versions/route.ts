import { entityRepo } from "@/src/db/instance";

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
	const versions = entityRepo.getVersions(id);
	return Response.json(versions, { headers: corsHeaders });
}
