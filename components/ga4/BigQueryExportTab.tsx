"use client";

import { useState } from "react";

interface BigQueryRow {
	id: string;
	event_date: string;
	event_timestamp: number;
	event_name: string;
	event_params: { key: string; value: string | number }[];
	user_pseudo_id: string;
	user_id?: string;
	privacy_info: { analytics_storage: string; ads_storage: string };
}

const SAMPLE_ROWS: BigQueryRow[] = [
	{
		id: "row_1",
		event_date: "20261118",
		event_timestamp: 1763481234000000,
		event_name: "purchase",
		event_params: [
			{ key: "transaction_id", value: "T_98124" },
			{ key: "value", value: 129.99 },
			{ key: "currency", value: "USD" },
			{ key: "page_location", value: "https://shop.com/checkout/success" },
		],
		user_pseudo_id: "192847192.1763400000",
		user_id: "USR_9921",
		privacy_info: {
			analytics_storage: "granted",
			ads_storage: "granted",
		},
	},
	{
		id: "row_2",
		event_date: "20261118",
		event_timestamp: 1763481180000000,
		event_name: "add_to_cart",
		event_params: [
			{ key: "item_id", value: "SKU_441" },
			{ key: "item_name", value: "Pro Running Shoes" },
			{ key: "value", value: 129.99 },
		],
		user_pseudo_id: "192847192.1763400000",
		privacy_info: {
			analytics_storage: "granted",
			ads_storage: "granted",
		},
	},
	{
		id: "row_3",
		event_date: "20261118",
		event_timestamp: 1763481000000000,
		event_name: "page_view",
		event_params: [
			{ key: "page_title", value: "Home Page" },
			{ key: "page_location", value: "https://shop.com/" },
		],
		user_pseudo_id: "847291823.1763400000",
		privacy_info: {
			analytics_storage: "denied",
			ads_storage: "denied",
		},
	},
];

export function BigQueryExportTab({
	rows: propRows,
}: {
	rows?: BigQueryRow[];
} = {}) {
	const rows = propRows && propRows.length > 0 ? propRows : SAMPLE_ROWS;
	const [filter, setFilter] = useState("");

	const filtered = rows.filter(
		(r) =>
			r.event_name.toLowerCase().includes(filter.toLowerCase()) ||
			r.user_pseudo_id.includes(filter),
	);

	const handleDownloadJson = () => {
		const blob = new Blob([JSON.stringify(rows, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ga4_events_export_${Date.now()}.json`;
		a.click();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						BigQuery Raw Export Pipeline
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						Standard Google BigQuery GA4 event export schema
						(`events_intraday_*` and `events_*`).
					</p>
				</div>
				<button
					type="button"
					onClick={handleDownloadJson}
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700"
				>
					⬇ Export NDJSON / JSON
				</button>
			</div>

			<div className="flex gap-4">
				<input
					type="text"
					placeholder="Filter by event name or Client ID..."
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
				/>
				<span className="self-center text-xs text-gray-500">
					Showing {filtered.length} of {rows.length} records
				</span>
			</div>

			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 uppercase">
							<tr>
								<th className="px-4 py-3">Event Date</th>
								<th className="px-4 py-3">Event Name</th>
								<th className="px-4 py-3">Client ID (user_pseudo_id)</th>
								<th className="px-4 py-3">User ID</th>
								<th className="px-4 py-3">Event Parameters</th>
								<th className="px-4 py-3">Consent Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 font-mono">
							{filtered.map((r) => (
								<tr key={r.id} className="hover:bg-gray-50/70">
									<td className="px-4 py-3 whitespace-nowrap">
										{r.event_date}
									</td>
									<td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">
										{r.event_name}
									</td>
									<td className="px-4 py-3 text-gray-900 whitespace-nowrap">
										{r.user_pseudo_id}
									</td>
									<td className="px-4 py-3 text-gray-500 whitespace-nowrap">
										{r.user_id || "null"}
									</td>
									<td className="max-w-xs truncate px-4 py-3 font-mono text-[11px] text-gray-700">
										{JSON.stringify(r.event_params)}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										<span
											className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
												r.privacy_info.analytics_storage === "granted"
													? "bg-green-100 text-green-800"
													: "bg-amber-100 text-amber-800"
											}`}
										>
											{r.privacy_info.analytics_storage}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
