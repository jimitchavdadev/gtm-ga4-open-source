import type { EventRepository } from "../db/event-repository";
import { DataRedactionEngine } from "../ga4/data-redaction";
import { Ga4ServerClient } from "../server-gtm/client";

export async function handleCollectRequest(
	req: Request,
	url: URL,
	eventRepo: EventRepository,
): Promise<void> {
	const ga4Client = new Ga4ServerClient();
	const bodyText = req.method === "POST" ? await req.text() : undefined;
	const queryObj: Record<string, string> = {};
	url.searchParams.forEach((v, k) => {
		queryObj[k] = v;
	});

	const hits = [];
	if (bodyText && bodyText.trim().length > 0) {
		if (bodyText.includes("\n")) {
			hits.push(...ga4Client.parseBatchWirePayload(bodyText));
		} else {
			const bodyParams: Record<string, string> = {};
			new URLSearchParams(bodyText).forEach((v, k) => {
				bodyParams[k] = v;
			});
			hits.push(ga4Client.parseWirePayload({ ...queryObj, ...bodyParams }));
		}
	} else {
		hits.push(ga4Client.parseWirePayload(queryObj));
	}

	const measurementId = url.searchParams.get("tid") || "";
	const stream = measurementId
		? eventRepo.getDataStreamByMeasurementId(measurementId)
		: null;
	const propertyId = stream?.property_id ?? "unknown_property";
	const streamId = stream?.id ?? "unknown_stream";

	for (const hit of hits) {
		const eventParams = {
			...hit.event_params,
			page_location: hit.page_location,
			page_referrer: hit.page_referrer,
			page_title: hit.page_title,
		};
		const sanitizedParams = DataRedactionEngine.sanitizeEventParams(
			eventParams,
			{ redactEmail: true, stripQueryParameters: ["token", "auth"] },
		);

		eventRepo.insertRawEvent({
			id: `hit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
			property_id: propertyId,
			stream_id: streamId,
			event_name: hit.event_name,
			client_id: hit.client_id,
			user_id: hit.user_id,
			session_id: hit.session_id ?? 0,
			timestamp_micros: Date.now() * 1000,
			event_params_json: JSON.stringify(sanitizedParams),
			user_properties_json: JSON.stringify(hit.user_properties ?? {}),
			items_json: JSON.stringify(hit.items ?? []),
			consent_json: JSON.stringify(hit.consent ?? {}),
			is_conversion: hit.event_name === "purchase" ? 1 : 0,
		});
	}
}
