import { eventRepo } from "@/src/db/instance";
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

	if (!validation.valid || !validation.canonicalEvents) {
		return Response.json(
			{
				error: "Invalid payload",
				validationMessages: validation.validationMessages,
			},
			{ status: 400, headers: corsHeaders },
		);
	}

	const stream = measurementId
		? eventRepo.getDataStreamByMeasurementId(measurementId)
		: null;
	const propertyId = stream?.property_id ?? "unknown_property";
	const streamId = stream?.id ?? "unknown_stream";

	for (const event of validation.canonicalEvents) {
		eventRepo.insertRawEvent({
			id: event.id,
			property_id: propertyId,
			stream_id: streamId,
			event_name: event.name,
			client_id: event.clientId,
			user_id: event.userId,
			session_id: event.params.ga_session_id ?? 0,
			timestamp_micros: event.timestampMicros,
			event_params_json: JSON.stringify(event.params),
			user_properties_json: JSON.stringify(event.userProperties ?? {}),
			items_json: JSON.stringify(event.items ?? []),
			consent_json: null,
			is_conversion: event.name === "purchase" ? 1 : 0,
		});
	}

	return new Response(null, { status: 204, headers: corsHeaders });
}
