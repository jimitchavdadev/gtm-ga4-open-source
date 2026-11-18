import { eventRepo } from "@/src/db/instance";
import { MeasurementProtocolValidator } from "@/src/ga4/measurement-protocol";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export async function handleMeasurementProtocol(
	req: Request,
): Promise<Response> {
	const url = new URL(req.url);
	const apiSecret = url.searchParams.get("api_secret") ?? undefined;
	const measurementId = url.searchParams.get("measurement_id") ?? undefined;
	const body = await req.json().catch(() => null);

	const validation = MeasurementProtocolValidator.validate(
		{ api_secret: apiSecret, measurement_id: measurementId },
		body,
	);
	if (!validation.valid || !validation.canonicalEvents) {
		return Response.json(
			{
				error: "Invalid payload",
				validationMessages: validation.validationMessages,
			},
			{ status: 400, headers: corsHeaders },
		);
	}
	for (const event of validation.canonicalEvents) {
		eventRepo.insertRawEvent({
			id: event.id,
			property_id: "prop_1",
			stream_id: "stream_1",
			event_name: event.name,
			client_id: event.clientId,
			user_id: event.userId,
			session_id: event.params.ga_session_id ?? 0,
			timestamp_micros: event.timestampMicros,
			event_params_json: JSON.stringify(event.params),
			user_properties_json: JSON.stringify(event.userProperties),
			consent_json: JSON.stringify({ gcs: "G111" }),
			is_conversion: 0,
		});
	}
	return new Response(null, { status: 204, headers: corsHeaders });
}
