import { entityRepo } from "@/src/db/instance";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: corsHeaders });
}

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const body = (await req.json().catch(() => null)) as any;
	const ok = entityRepo.updateEntity(id, {
		name: body?.name,
		data_json: body?.data ? JSON.stringify(body.data) : undefined,
		fingerprint: Math.random().toString(36).substring(2, 10),
	});
	return Response.json({ success: ok }, { headers: corsHeaders });
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const ok = entityRepo.deleteEntity(id);
	return Response.json({ success: ok }, { headers: corsHeaders });
}
