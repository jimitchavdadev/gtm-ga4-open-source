import { eventRepo } from "@/src/db/instance";
import { handleCollectRequest } from "@/src/server/collect-handler";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
	const url = new URL(req.url);
	await handleCollectRequest(req, url, eventRepo);
	return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
	const url = new URL(req.url);
	await handleCollectRequest(req, url, eventRepo);
	return new Response(null, { status: 204, headers: corsHeaders });
}
