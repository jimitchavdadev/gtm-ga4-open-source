import { createHash } from "node:crypto";
import type { CanonicalEventData, ServerTransformationRule } from "./types";

export class TransformationPipeline {
	private rules: ServerTransformationRule[] = [];

	public addRule(rule: ServerTransformationRule): void {
		this.rules.push(rule);
		this.rules.sort((a, b) => b.priority - a.priority);
	}

	public apply(eventData: CanonicalEventData): CanonicalEventData {
		let data: CanonicalEventData = JSON.parse(JSON.stringify(eventData));

		for (const rule of this.rules) {
			data = this.executeRule(data, rule);
		}

		return data;
	}

	private executeRule(
		data: CanonicalEventData,
		rule: ServerTransformationRule,
	): CanonicalEventData {
		const clone = { ...data };

		switch (rule.action) {
			case "ALLOWLIST": {
				const allowedSet = new Set(rule.targetFields);
				const filteredParams: Record<string, any> = {};
				for (const [k, v] of Object.entries(clone.event_params)) {
					if (allowedSet.has(k)) {
						filteredParams[k] = v;
					}
				}
				clone.event_params = filteredParams;
				break;
			}
			case "BLOCKLIST": {
				const blockedSet = new Set(rule.targetFields);
				for (const field of blockedSet) {
					delete clone.event_params[field];
				}
				break;
			}
			case "HASH_SHA256": {
				for (const field of rule.targetFields) {
					const val = clone.event_params[field];
					if (typeof val === "string") {
						clone.event_params[field] = createHash("sha256")
							.update(val.trim().toLowerCase())
							.digest("hex");
					}
				}
				break;
			}
			case "AUGMENT": {
				if (rule.augmentData) {
					clone.event_params = {
						...clone.event_params,
						...rule.augmentData,
					};
				}
				break;
			}
		}

		return clone;
	}
}
