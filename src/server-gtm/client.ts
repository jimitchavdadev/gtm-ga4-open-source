import type { CanonicalEventData } from "./types";

export class Ga4ServerClient {
	public claimRequest(path: string): boolean {
		return path === "/g/collect" || path === "/mp/collect";
	}

	public parseWirePayload(
		urlParams: Record<string, string>,
		headers: Record<string, string> = {},
		ip = "127.0.0.1",
	): CanonicalEventData {
		const eventParams: Record<string, any> = {};
		const userProperties: Record<string, any> = {};

		for (const [key, value] of Object.entries(urlParams)) {
			if (key.startsWith("ep.")) {
				eventParams[key.substring(3)] = value;
			} else if (key.startsWith("epn.")) {
				eventParams[key.substring(4)] = Number(value);
			} else if (key.startsWith("up.")) {
				userProperties[key.substring(3)] = value;
			} else if (key.startsWith("upn.")) {
				userProperties[key.substring(4)] = Number(value);
			}
		}

		return {
			event_name: urlParams.en || "unknown_event",
			client_id: urlParams.cid || "anonymous",
			user_id: urlParams.uid,
			session_id: urlParams.sid ? Number(urlParams.sid) : undefined,
			session_number: urlParams.sct ? Number(urlParams.sct) : undefined,
			page_location: urlParams.dl || "https://example.com",
			page_referrer: urlParams.dr,
			page_title: urlParams.dt,
			ip_override: ip,
			user_agent: headers["user-agent"] || "",
			event_params: eventParams,
			user_properties: userProperties,
			consent: {
				ad_storage: urlParams.gcs?.includes("1") ? "granted" : "denied",
				analytics_storage: urlParams.gcs?.endsWith("1") ? "granted" : "denied",
			},
		};
	}

	public parseBatchWirePayload(
		rawBody: string,
		headers: Record<string, string> = {},
		ip = "127.0.0.1",
	): CanonicalEventData[] {
		const lines = rawBody
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);
		return lines.map((line) => {
			const searchParams = new URLSearchParams(line);
			const paramsObj: Record<string, string> = {};
			searchParams.forEach((val, key) => {
				paramsObj[key] = val;
			});
			return this.parseWirePayload(paramsObj, headers, ip);
		});
	}
}
