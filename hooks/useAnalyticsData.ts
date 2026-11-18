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
	const [annotations, setAnnotations] = useState<any[]>([]);
	const [bigQueryRows, setBigQueryRows] = useState<any[]>([]);
	const [funnelData, setFunnelData] = useState<any>(null);
	const [diagnostics, setDiagnostics] = useState<any>(null);
	const [reportingIdentity, setReportingIdentity] = useState<any>(null);

	const loadData = useCallback(async () => {
		try {
			const [t, tr, v, ver, rt, s, a, ann, bq, fn, diag, id] =
				await Promise.all([
					fetch(`/api/v1/workspaces/${workspaceId}/entities?type=TAG`).then(
						(r) => (r.ok ? r.json() : []),
					),
					fetch(`/api/v1/workspaces/${workspaceId}/entities?type=TRIGGER`).then(
						(r) => (r.ok ? r.json() : []),
					),
					fetch(
						`/api/v1/workspaces/${workspaceId}/entities?type=VARIABLE`,
					).then((r) => (r.ok ? r.json() : [])),
					fetch(`/api/v1/containers/${containerId}/versions`).then((r) =>
						r.ok ? r.json() : [],
					),
					fetch(`/api/v1/properties/${propertyId}/realtime`).then((r) =>
						r.ok ? r.json() : null,
					),
					fetch(`/api/v1/properties/${propertyId}/reports/standard`).then(
						(r) => (r.ok ? r.json() : null),
					),
					fetch(`/api/v1/properties/${propertyId}/reports/attribution`).then(
						(r) => (r.ok ? r.json() : null),
					),
					fetch(`/api/v1/properties/${propertyId}/annotations`).then((r) =>
						r.ok ? r.json() : [],
					),
					fetch(`/api/v1/properties/${propertyId}/export/bigquery`).then((r) =>
						r.ok ? r.json() : null,
					),
					fetch(`/api/v1/properties/${propertyId}/reports/funnel`).then((r) =>
						r.ok ? r.json() : null,
					),
					fetch(`/api/v1/containers/${containerId}/diagnostics`).then((r) =>
						r.ok ? r.json() : null,
					),
					fetch(`/api/v1/properties/${propertyId}/identity`).then((r) =>
						r.ok ? r.json() : null,
					),
				]);
			setTags(t);
			setTriggers(tr);
			setVariables(v);
			setVersions(ver);
			setRealtimeData(rt);
			setStandardReports(s);
			setAttributionData(a);
			setAnnotations(ann);
			setBigQueryRows(bq?.rows || []);
			setFunnelData(fn);
			setDiagnostics(diag);
			setReportingIdentity(id);
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

	const createAnnotation = async (
		title: string,
		description: string,
		date: string,
		color: string,
	) => {
		const res = await fetch(`/api/v1/properties/${propertyId}/annotations`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title, description, date, color }),
		});
		if (res.ok) {
			onNotify(`Annotation "${title}" recorded!`);
			loadData();
		}
	};

	const deleteAnnotation = async (id: string) => {
		const res = await fetch(`/api/v1/annotations/${id}`, { method: "DELETE" });
		if (res.ok) {
			onNotify("Annotation removed");
			loadData();
		}
	};

	const sendTestHit = async (useCloaked = false) => {
		const endpoint = useCloaked ? "/api/v1/telemetry" : "/g/collect";
		await fetch(
			`${endpoint}?v=2&tid=${containerId}&cid=user_${Date.now()}&en=purchase&ep.value=149.99&ep.currency=USD`,
			{ method: "POST" },
		);
		await loadData();
		onNotify(
			useCloaked
				? "Live hit received via cloaked endpoint!"
				: "Wire hit received live in Realtime & BigQuery!",
		);
	};

	const runExploration = async (technique: string) => {
		const res = await fetch(
			`/api/v1/properties/${propertyId}/reports/explorations/${technique.toLowerCase()}`,
		);
		return res.ok ? res.json() : null;
	};

	return {
		tags,
		triggers,
		variables,
		versions,
		realtimeData,
		standardReports,
		attributionData,
		annotations,
		bigQueryRows,
		funnelData,
		diagnostics,
		reportingIdentity,
		createEntity,
		deleteEntity,
		publishWorkspace,
		createAnnotation,
		deleteAnnotation,
		sendTestHit,
		runExploration,
		refresh: loadData,
	};
}
