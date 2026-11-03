import type { EventRepository } from "../db/event-repository";
import { MeasurementProtocolValidator } from "../ga4/measurement-protocol";
import { generateGtmScript } from "./client-template";
import { handleCollectRequest } from "./collect-handler";

export interface ServerConfig {
	port?: number;
	hostname?: string;
	eventRepo: EventRepository;
}

export function createAnalyticsServer(config: ServerConfig) {
	const port = config.port ?? 3000;
	const hostname = config.hostname ?? "0.0.0.0";
	const eventRepo = config.eventRepo;

	return Bun.serve({
		port,
		hostname,
		async fetch(req: Request) {
			const url = new URL(req.url);
			const corsHeaders = {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
			};

			if (req.method === "OPTIONS") {
				return new Response(null, { status: 204, headers: corsHeaders });
			}

			// GET /healthz
			if (url.pathname === "/healthz") {
				return Response.json(
					{ status: "ok", timestamp: Date.now() },
					{ headers: corsHeaders },
				);
			}

			// GET /gtm.js
			if (url.pathname === "/gtm.js") {
				const id = url.searchParams.get("id");
				if (!id) {
					return new Response("Missing required id parameter", {
						status: 400,
						headers: corsHeaders,
					});
				}
				const script = generateGtmScript(id);
				return new Response(script, {
					status: 200,
					headers: {
						...corsHeaders,
						"Content-Type": "application/javascript; charset=UTF-8",
						"Cache-Control": "public, max-age=900, stale-while-revalidate=3600",
					},
				});
			}

			// POST or GET /g/collect
			if (url.pathname === "/g/collect") {
				await handleCollectRequest(req, url, eventRepo);
				return new Response(null, { status: 204, headers: corsHeaders });
			}

			// POST /debug/mp/collect
			if (url.pathname === "/debug/mp/collect") {
				const apiSecret = url.searchParams.get("api_secret") ?? undefined;
				const measurementId =
					url.searchParams.get("measurement_id") ?? undefined;
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

			// POST /mp/collect
			if (url.pathname === "/mp/collect") {
				const apiSecret = url.searchParams.get("api_secret") ?? undefined;
				const measurementId =
					url.searchParams.get("measurement_id") ?? undefined;
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

			// GET /api/v1/properties/:id/realtime
			const realtimeMatch = url.pathname.match(
				/^\/api\/v1\/properties\/([^/]+)\/realtime$/,
			);
			if (realtimeMatch?.[1]) {
				const propertyId = realtimeMatch[1];
				const events = eventRepo.getRecentEvents(propertyId, 50);
				const uniqueUsers = new Set(events.map((e) => e.client_id)).size;

				return Response.json(
					{
						propertyId,
						activeUsersLast30Min: uniqueUsers,
						eventCount: events.length,
						events,
					},
					{ headers: corsHeaders },
				);
			}

			return new Response("Not Found", { status: 404, headers: corsHeaders });
		},
	});
}
