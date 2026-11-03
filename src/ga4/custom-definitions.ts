export type DefinitionScope = "EVENT" | "USER" | "ITEM";

export interface CustomDefinitionConfig {
	parameterName: string;
	displayName: string;
	scope: DefinitionScope;
	isMetric?: boolean;
}

export interface CalculatedMetricConfig {
	id: string;
	displayName: string;
	formula: string; // e.g. "purchase_revenue / total_users"
	format: "FLOAT" | "PERCENT" | "CURRENCY";
}

export class CustomDefinitionsRegistry {
	private definitions = new Map<string, CustomDefinitionConfig>();
	private calculatedMetrics = new Map<string, CalculatedMetricConfig>();

	constructor(private is360 = false) {}

	public registerDefinition(config: CustomDefinitionConfig): void {
		const limits = this.getLimits();
		const currentCount = this.getCountByScope(config.scope, config.isMetric);

		if (config.isMetric) {
			if (currentCount >= limits.metrics) {
				throw new Error(`Metric limit reached: ${limits.metrics}`);
			}
		} else {
			if (config.scope === "EVENT" && currentCount >= limits.eventDimensions) {
				throw new Error(
					`Event dimension limit reached: ${limits.eventDimensions}`,
				);
			}
			if (config.scope === "USER" && currentCount >= limits.userDimensions) {
				throw new Error(
					`User dimension limit reached: ${limits.userDimensions}`,
				);
			}
			if (config.scope === "ITEM" && currentCount >= limits.itemDimensions) {
				throw new Error(
					`Item dimension limit reached: ${limits.itemDimensions}`,
				);
			}
		}

		this.definitions.set(config.parameterName, config);
	}

	public registerCalculatedMetric(config: CalculatedMetricConfig): void {
		const limit = this.is360 ? 50 : 5;
		if (this.calculatedMetrics.size >= limit) {
			throw new Error(`Calculated metric limit reached: ${limit}`);
		}
		this.calculatedMetrics.set(config.id, config);
	}

	public evaluateCalculatedMetric(
		metricId: string,
		metricsContext: Record<string, number>,
	): number {
		const config = this.calculatedMetrics.get(metricId);
		if (!config) throw new Error(`Metric ${metricId} not found`);

		// Sanitize formula: only allow arithmetic and variable names
		let expr = config.formula;
		for (const [key, val] of Object.entries(metricsContext)) {
			expr = expr.replace(new RegExp(`\\b${key}\\b`, "g"), String(val));
		}

		if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
			throw new Error("Invalid formula syntax");
		}

		const result = Function(`"use strict"; return (${expr})`)();
		return Number(result);
	}

	private getLimits() {
		return {
			eventDimensions: this.is360 ? 125 : 50,
			userDimensions: this.is360 ? 100 : 25,
			itemDimensions: this.is360 ? 25 : 10,
			metrics: this.is360 ? 125 : 50,
		};
	}

	private getCountByScope(scope: DefinitionScope, isMetric = false): number {
		return Array.from(this.definitions.values()).filter(
			(d) => d.scope === scope && Boolean(d.isMetric) === isMetric,
		).length;
	}
}
