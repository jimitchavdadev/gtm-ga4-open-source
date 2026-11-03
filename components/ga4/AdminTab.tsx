"use client";

import { useState } from "react";

export function AdminTab() {
	const [emailRedaction, setEmailRedaction] = useState(true);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-bold text-gray-900">Property Settings & Administration</h2>
				<p className="mt-1 text-sm text-gray-500">
					Manage data streams, custom dimensions, privacy controls, and 360 subproperties
				</p>
			</div>

			{/* Data Streams */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<div className="flex items-center justify-between border-b border-gray-100 pb-4">
					<h3 className="text-base font-bold text-gray-900">Data Streams</h3>
					<button
						type="button"
						className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
					>
						+ Add Stream
					</button>
				</div>
				<div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm font-bold text-gray-900">🌐 Web Data Stream - Production Store</div>
							<div className="mt-0.5 text-xs text-gray-500">
								Stream URL: <code className="text-gray-700">https://example.com</code>
							</div>
						</div>
						<div className="text-right">
							<div className="text-xs uppercase text-gray-400">Measurement ID</div>
							<div className="font-mono text-sm font-bold text-blue-600">G-TESTSTREAM</div>
						</div>
					</div>

					<div className="mt-4 flex flex-wrap gap-4 border-t border-gray-200 pt-3 text-xs text-gray-600">
						<div>
							Enhanced Measurement: <strong className="text-emerald-600">Active (All 6 events)</strong>
						</div>
						<div>
							Measurement Protocol Secret: <code className="text-gray-800">secret_123</code>
						</div>
					</div>
				</div>
			</div>

			{/* Custom Definitions */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Custom Definitions (Free & 360 Limits)</h3>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Definition Name</th>
								<th className="px-4 py-3">Scope</th>
								<th className="px-4 py-3">Event Parameter</th>
								<th className="px-4 py-3">Quota Usage</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">Customer Tier</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
										User Scoped
									</span>
								</td>
								<td className="px-4 py-3 font-mono text-xs">customer_tier</td>
								<td className="px-4 py-3 text-xs text-gray-500">1 / 100 used (360)</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">Blog Author</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
										Event Scoped
									</span>
								</td>
								<td className="px-4 py-3 font-mono text-xs">author_name</td>
								<td className="px-4 py-3 text-xs text-gray-500">1 / 125 used (360)</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">Average Order Value (AOV)</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
										Calculated Metric
									</span>
								</td>
								<td className="px-4 py-3 font-mono text-xs">{`{value} / {purchases}`}</td>
								<td className="px-4 py-3 text-xs text-gray-500">1 / 50 used (360)</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Data Privacy & Redaction */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Data Privacy & Email Redaction</h3>
				<div className="mt-4 space-y-4">
					<label className="flex items-start gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={emailRedaction}
							onChange={(e) => setEmailRedaction(e.target.checked)}
							className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
						/>
						<div>
							<div className="text-sm font-semibold text-gray-900">
								Automated Email Address Redaction
							</div>
							<div className="text-xs text-gray-500">
								Scans incoming query parameters and event payloads for email addresses and replaces them with{" "}
								<code>(redacted)</code> before database persistence.
							</div>
						</div>
					</label>

					<div>
						<label className="block text-xs font-semibold uppercase text-gray-600">
							Stripped URL Query Parameters (Sensitive Data)
						</label>
						<input
							type="text"
							defaultValue="token, auth, password, ssn, session_secret"
							className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-hidden"
						/>
					</div>
				</div>
			</div>

			{/* 360 Subproperties & Rollups */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<div className="flex items-center gap-2">
					<h3 className="text-base font-bold text-gray-900">360 Subproperties & Roll-up Properties</h3>
					<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase text-blue-700">
						360 Tier
					</span>
				</div>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Property Name</th>
								<th className="px-4 py-3">Type</th>
								<th className="px-4 py-3">Filter / Source Rule</th>
								<th className="px-4 py-3">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">US Region Subproperty</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
										Subproperty
									</span>
								</td>
								<td className="px-4 py-3 font-mono text-xs">country == 'US'</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
										Routing Hits
									</span>
								</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">Global Enterprise Roll-up</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
										Roll-up Property
									</span>
								</td>
								<td className="px-4 py-3 text-xs">Aggregates Web Store + EU Regional</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
										Aggregating
									</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
