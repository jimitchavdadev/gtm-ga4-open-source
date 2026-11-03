export interface ZoneConfig {
	id: string;
	name: string;
	childContainerPublicId: string;
	boundaryCondition: (url: string) => boolean;
	typeRestriction?: {
		mode: "ALLOWLIST" | "BLOCKLIST";
		tagTypes: string[];
	};
}

export class ZoneEngine {
	private zones = new Map<string, ZoneConfig>();

	public registerZone(zone: ZoneConfig): void {
		this.zones.set(zone.id, zone);
	}

	public getActiveZones(currentUrl: string): ZoneConfig[] {
		const active: ZoneConfig[] = [];
		for (const zone of this.zones.values()) {
			if (zone.boundaryCondition(currentUrl)) {
				active.push(zone);
			}
		}
		return active;
	}

	public isTagTypeAllowedInZone(zoneId: string, tagType: string): boolean {
		const zone = this.zones.get(zoneId);
		if (!zone?.typeRestriction) return true;

		const { mode, tagTypes } = zone.typeRestriction;
		const contains = tagTypes.includes(tagType);

		if (mode === "ALLOWLIST") {
			return contains;
		}
		if (mode === "BLOCKLIST") {
			return !contains;
		}
		return true;
	}
}
