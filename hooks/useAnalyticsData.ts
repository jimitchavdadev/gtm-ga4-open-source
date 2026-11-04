"use client";

import { useCallback, useEffect, useState } from "react";

interface UseAnalyticsDataProps {
	workspaceId: string;
	containerId: string;
	propertyId: string;
	onNotify: (msg: string) => void;
}

export function useAnalyticsData({
	workspaceId,
	containerId,
	propertyId,
	onNotify,
}: UseAnalyticsDataProps) {
	const [tags, setTags] = useState<any[]>([]);
	const [triggers, setTriggers] = useState<any[]>([]);
	const [variables, setVariables] = useState<any[]>([]);
	const [versions, setVersions] = useState<any[]>([]);
	const [realtimeData, setRealtimeData] = useState<any>(null);
	const [standardReports, setStandardReports] = useState<any>(null);
	const [attributionData, setAttributionData] = useState<any>(null);

	const loadData = useCallback(async () => {
		try {
			const [tRes, trRes, vRes, verRes, rRes, sRes, aRes] = await Promise.all([
				fetch(`/api/v1/workspaces/${workspaceId}/entities?type=TAG`).then(
					(r) => (r.ok ? r.json() : []),
				),
				fetch(`/api/v1/workspaces/${workspaceId}/entities?type=TRIGGER`).then(
					(r) => (r.ok ? r.json() : []),
				),
				fetch(`/api/v1/workspaces/${workspaceId}/entities?type=VARIABLE`).then(
					(r) => (r.ok ? r.json() : []),
				),
				fetch(`/api/v1/containers/${containerId}/versions`).then((r) =>
					r.ok ? r.json() : [],
				),
				fetch(`/api/v1/properties/${propertyId}/realtime`).then((r) =>
					r.ok ? r.json() : null,
				),
				fetch(`/api/v1/properties/${propertyId}/reports/standard`).then((r) =>
					r.ok ? r.json() : null,
				),
				fetch(`/api/v1/properties/${propertyId}/reports/attribution`).then(
					(r) => (r.ok ? r.json() : null),
				),
			]);
			setTags(tRes);
			setTriggers(trRes);
			setVariables(vRes);
			setVersions(verRes);
			setRealtimeData(rRes);
			setStandardReports(sRes);
			setAttributionData(aRes);
		} catch {}
	}, [workspaceId, containerId, propertyId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const createEntity = async (name: string, entity_type: string, data: any) => {
		const res = await fetch(`/api/v1/workspaces/${workspaceId}/entities`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, entity_type, data }),
		});
		if (res.ok) {
			onNotify(`${entity_type} "${name}" created!`);
			loadData();
		}
	};

	const deleteEntity = async (id: string) => {
		const res = await fetch(`/api/v1/entities/${id}`, { method: "DELETE" });
		if (res.ok) {
			onNotify("Item deleted");
			loadData();
		}
	};

	const publishWorkspace = async (name: string, description: string) => {
		const res = await fetch(`/api/v1/workspaces/${workspaceId}/publish`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ container_id: containerId, name, description }),
		});
		if (res.ok) {
			onNotify(`Version "${name}" published!`);
			loadData();
		}
	};

	const sendTestHit = async () => {
		await fetch(
			`/g/collect?v=2&tid=${containerId}&cid=user_${Date.now()}&en=purchase&ep.value=129.5&ep.currency=USD`,
			{ method: "POST" },
		);
		const refreshed = await fetch(
			`/api/v1/properties/${propertyId}/realtime`,
		).then((r) => r.json());
		setRealtimeData(refreshed);
		onNotify("Wire hit received live in Realtime!");
	};

	return {
		tags,
		triggers,
		variables,
		versions,
		realtimeData,
		standardReports,
		attributionData,
		createEntity,
		deleteEntity,
		publishWorkspace,
		sendTestHit,
	};
}
