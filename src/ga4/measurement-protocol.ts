import type { Ga4Event } from "./types";

export interface ValidationMessage {
	fieldPath: string;
	description: string;
	validationCode: string;
}

export interface MpValidationResult {
	valid: boolean;
	validationMessages: ValidationMessage[];
	canonicalEvents?: Ga4Event[];
}

export class MeasurementProtocolValidator {
	private static readonly RESERVED_PREFIXES = ["ga_", "google_", "firebase_"];
	private static readonly NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;

	public static validate(
		query: { api_secret?: string; measurement_id?: string },
		body: any,
		tier: "FREE" | "360" = "FREE",
	): MpValidationResult {
		const messages: ValidationMessage[] = [];

		if (!query.api_secret || query.api_secret.trim().length === 0) {
			messages.push({
				fieldPath: "api_secret",
				description: "api_secret is required and cannot be empty.",
				validationCode: "VALUE_REQUIRED",
			});
		}

		if (!query.measurement_id || !/^G-[A-Z0-9]+$/i.test(query.measurement_id)) {
			messages.push({
				fieldPath: "measurement_id",
				description: "measurement_id must be formatted like G-XXXXXXX.",
				validationCode: "VALUE_INVALID",
			});
		}

		if (!body || typeof body !== "object") {
			messages.push({
				fieldPath: "",
				description: "Request body must be a valid JSON object.",
				validationCode: "BODY_INVALID",
			});
			return { valid: false, validationMessages: messages };
		}

		if (!body.client_id && !body.app_instance_id) {
			messages.push({
				fieldPath: "client_id",
				description: "Either client_id or app_instance_id is required.",
				validationCode: "VALUE_REQUIRED",
			});
		}

		if (body.timestamp_micros) {
			const nowMicros = Date.now() * 1000;
			const deltaHours =
				(nowMicros - body.timestamp_micros) / (1000 * 1000 * 3600);
			if (deltaHours > 72) {
				messages.push({
					fieldPath: "timestamp_micros",
					description: "Timestamp cannot be older than 72 hours.",
					validationCode: "TIMESTAMP_TOO_OLD",
				});
			} else if (deltaHours < -0.25) {
				messages.push({
					fieldPath: "timestamp_micros",
					description:
						"Timestamp cannot be more than 15 minutes in the future.",
					validationCode: "TIMESTAMP_IN_FUTURE",
				});
			}
		}

		if (!Array.isArray(body.events) || body.events.length === 0) {
			messages.push({
				fieldPath: "events",
				description: "events must be a non-empty array (1-25 events).",
				validationCode: "VALUE_INVALID",
			});
		} else if (body.events.length > 25) {
			messages.push({
				fieldPath: "events",
				description: "events array cannot exceed 25 events.",
				validationCode: "ARRAY_TOO_LONG",
			});
		} else {
			const maxParams = tier === "360" ? 100 : 25;
			body.events.forEach((event: any, index: number) => {
				const path = `events[${index}]`;
				if (!event.name || !this.NAME_REGEX.test(event.name)) {
					messages.push({
						fieldPath: `${path}.name`,
						description:
							"Event name must be 1-40 alphanumeric characters or underscores.",
						validationCode: "NAME_INVALID",
					});
				} else if (
					this.RESERVED_PREFIXES.some((p) => event.name.startsWith(p))
				) {
					messages.push({
						fieldPath: `${path}.name`,
						description: "Event name cannot start with reserved prefix.",
						validationCode: "NAME_RESERVED",
					});
				}

				if (event.params && typeof event.params === "object") {
					const paramKeys = Object.keys(event.params);
					if (paramKeys.length > maxParams) {
						messages.push({
							fieldPath: `${path}.params`,
							description: `Event cannot have more than ${maxParams} parameters.`,
							validationCode: "TOO_MANY_PARAMS",
						});
					}
					for (const key of paramKeys) {
						if (!this.NAME_REGEX.test(key)) {
							messages.push({
								fieldPath: `${path}.params.${key}`,
								description:
									"Parameter key must be 1-40 alphanumeric/underscores.",
								validationCode: "PARAM_NAME_INVALID",
							});
						} else if (this.RESERVED_PREFIXES.some((p) => key.startsWith(p))) {
							messages.push({
								fieldPath: `${path}.params.${key}`,
								description: "Parameter key cannot start with reserved prefix.",
								validationCode: "PARAM_NAME_RESERVED",
							});
						}
					}
				}
			});
		}

		if (messages.length > 0) {
			return { valid: false, validationMessages: messages };
		}

		const eventTime = body.timestamp_micros
			? Math.floor(body.timestamp_micros / 1000)
			: Date.now();

		const canonicalEvents: Ga4Event[] = body.events.map(
			(e: any, idx: number) => ({
				id: `mp_${eventTime}_${idx}`,
				name: e.name,
				clientId: body.client_id || body.app_instance_id || "anonymous",
				userId: body.user_id,
				timestampMicros: body.timestamp_micros || eventTime * 1000,
				params: {
					...e.params,
					ga_session_id: e.params?.session_id ?? e.params?.ga_session_id,
				},
			}),
		);

		return { valid: true, validationMessages: [], canonicalEvents };
	}
}
