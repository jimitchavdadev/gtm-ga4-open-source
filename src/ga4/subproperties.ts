import type { Ga4Event } from "./types";

export interface SubpropertyRule {
	field: string;
	operator: "EQUALS" | "CONTAINS" | "STARTS_WITH";
	value: string;
}

export interface SubpropertyConfig {
	id: string;
	sourcePropertyId: string;
	name: string;
	filterRules: SubpropertyRule[];
}

export interface RollupPropertyConfig {
	id: string;
	name: string;
	sourcePropertyIds: string[];
}

export class PropertyHierarchyEngine {
	private subproperties: Map<string, SubpropertyConfig> = new Map();
	private rollups: Map<string, RollupPropertyConfig> = new Map();

	public registerSubproperty(
		tier: "FREE" | "360",
		config: SubpropertyConfig,
	): boolean {
		if (tier !== "360") {
			throw new Error("Subproperties require GA4 360 Enterprise tier");
		}
		const existingForSource = Array.from(this.subproperties.values()).filter(
			(s) => s.sourcePropertyId === config.sourcePropertyId,
		);
		if (existingForSource.length >= 400) {
			throw new Error("Subproperty limit of 400 exceeded for source property");
		}
		this.subproperties.set(config.id, config);
		return true;
	}

	public registerRollup(
		tier: "FREE" | "360",
		config: RollupPropertyConfig,
	): boolean {
		if (tier !== "360") {
			throw new Error("Roll-up properties require GA4 360 Enterprise tier");
		}
		if (config.sourcePropertyIds.length > 200) {
			throw new Error("Roll-up source property limit of 200 exceeded");
		}
		this.rollups.set(config.id, config);
		return true;
	}

	public routeSubproperties(
		sourcePropertyId: string,
		event: Ga4Event,
	): string[] {
		const matchedIds: string[] = [];
		for (const sub of this.subproperties.values()) {
			if (sub.sourcePropertyId !== sourcePropertyId) continue;

			const matches = sub.filterRules.every((rule) => {
				let val: any;
				if (rule.field.startsWith("params.")) {
					val = event.params[rule.field.slice(7)];
				} else if (rule.field === "name") {
					val = event.name;
				}

				if (val === undefined || val === null) return false;
				const strVal = String(val);

				switch (rule.operator) {
					case "EQUALS":
						return strVal === rule.value;
					case "CONTAINS":
						return strVal.includes(rule.value);
					case "STARTS_WITH":
						return strVal.startsWith(rule.value);
					default:
						return false;
				}
			});

			if (matches) matchedIds.push(sub.id);
		}
		return matchedIds;
	}

	public routeRollups(
		sourcePropertyId: string,
		event: Ga4Event,
	): { rollupId: string; rollupEvent: Ga4Event }[] {
		const results: { rollupId: string; rollupEvent: Ga4Event }[] = [];
		for (const rollup of this.rollups.values()) {
			if (rollup.sourcePropertyIds.includes(sourcePropertyId)) {
				const rollupEvent: Ga4Event = {
					...event,
					params: {
						...event.params,
						_source_property_id: sourcePropertyId,
					},
				};
				results.push({ rollupId: rollup.id, rollupEvent });
			}
		}
		return results;
	}
}
