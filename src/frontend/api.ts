export class ApiClient {
	public static async fetchEntities(
		workspaceId: string,
		type?: string,
	): Promise<any[]> {
		const q = type ? `?type=${type}` : "";
		const res = await fetch(`/api/v1/workspaces/${workspaceId}/entities${q}`);
		if (!res.ok) return [];
		return res.json();
	}

	public static async createEntity(
		workspaceId: string,
		data: { name: string; entity_type: string; data: any },
	): Promise<any> {
		const res = await fetch(`/api/v1/workspaces/${workspaceId}/entities`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		return res.json();
	}

	public static async updateEntity(id: string, updates: any): Promise<any> {
		const res = await fetch(`/api/v1/entities/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updates),
		});
		return res.json();
	}

	public static async deleteEntity(id: string): Promise<boolean> {
		const res = await fetch(`/api/v1/entities/${id}`, { method: "DELETE" });
		return res.ok;
	}

	public static async publishWorkspace(
		workspaceId: string,
		containerId: string,
		name: string,
		description: string,
	): Promise<any> {
		const res = await fetch(`/api/v1/workspaces/${workspaceId}/publish`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ container_id: containerId, name, description }),
		});
		return res.json();
	}

	public static async fetchVersions(containerId: string): Promise<any[]> {
		const res = await fetch(`/api/v1/containers/${containerId}/versions`);
		if (!res.ok) return [];
		return res.json();
	}

	public static async fetchRealtime(propertyId: string): Promise<any> {
		const res = await fetch(`/api/v1/properties/${propertyId}/realtime`);
		if (!res.ok) return null;
		return res.json();
	}

	public static async fetchStandardReports(propertyId: string): Promise<any> {
		const res = await fetch(
			`/api/v1/properties/${propertyId}/reports/standard`,
		);
		if (!res.ok) return null;
		return res.json();
	}

	public static async fetchAttribution(propertyId: string): Promise<any> {
		const res = await fetch(
			`/api/v1/properties/${propertyId}/reports/attribution`,
		);
		if (!res.ok) return null;
		return res.json();
	}

	public static async fetchFunnel(propertyId: string): Promise<any> {
		const res = await fetch(`/api/v1/properties/${propertyId}/reports/funnel`);
		if (!res.ok) return null;
		return res.json();
	}
}
