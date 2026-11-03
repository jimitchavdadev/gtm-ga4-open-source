import { MeasurementProtocolValidator } from "@/src/ga4/measurement-protocol";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
	const url = new URL(req.url);
	const apiSecret = url.searchParams.get("api_secret") ?? undefined;
	const measurementId = url.searchParams.get("measurement_id") ?? undefined;
	const body = await req.json().catch(() => null);

	const validation = MeasurementProtocolValidator.validate(
		{ api_secret: apiSecret, measurement_id: measurementId },
		body,
	);

	return Response.json(
		{ validationMessages: validation.validationMessages },
		{ status: 200, headers: corsHeaders },
	);
}
