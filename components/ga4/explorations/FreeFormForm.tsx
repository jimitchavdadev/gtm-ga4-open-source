"use client";

import { useState } from "react";

export function FreeFormForm() {
	const [dimension, setDimension] = useState("channel");

	const rows = [
		{
			name: "Organic Search",
			users: "4,120",
			sessions: "5,820",
			engRate: "72.4%",
			conv: 142,
			rev: "$14,290",
		},
		{
			name: "Paid Search",
			users: "2,840",
			sessions: "3,410",
			engRate: "78.1%",
			conv: 215,
			rev: "$22,480",
		},
		{
			name: "Direct",
			users: "1,950",
			sessions: "2,200",
			engRate: "68.5%",
			conv: 88,
			rev: "$7,920",
		},
		{
			name: "Email Marketing",
			users: "1,120",
			sessions: "1,450",
			engRate: "82.6%",
			conv: 120,
			rev: "$12,650",
		},
		{
			name: "Referral",
			users: "650",
			sessions: "790",
			engRate: "66.2%",
			conv: 32,
			rev: "$3,140",
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
				<div>
					<h3 className="text-base font-bold text-gray-900">
						Free-form Exploration
					</h3>
					<p className="mt-0.5 text-xs text-gray-500">
						Cross-tabulation matrix with flexible breakdown dimensions
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold text-gray-600">
						Breakdown:
					</span>
					<select
						value={dimension}
						onChange={(e) => setDimension(e.target.value)}
						className="rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-700 focus:outline-hidden"
					>
						<option value="channel">Session Default Channel Group</option>
						<option value="device">Device Category</option>
						<option value="country">Country</option>
						<option value="landing">Landing Page</option>
					</select>
				</div>
			</div>

			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left text-sm text-gray-600">
					<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
						<tr>
							<th className="px-4 py-3">Dimension</th>
							<th className="px-4 py-3">Active Users</th>
							<th className="px-4 py-3">Sessions</th>
							<th className="px-4 py-3">Engagement Rate</th>
							<th className="px-4 py-3">Key Events</th>
							<th className="px-4 py-3">Total Revenue</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((row) => (
							<tr key={row.name} className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">
									{row.name}
								</td>
								<td className="px-4 py-3">{row.users}</td>
								<td className="px-4 py-3">{row.sessions}</td>
								<td className="px-4 py-3 font-medium text-emerald-600">
									{row.engRate}
								</td>
								<td className="px-4 py-3 font-bold text-gray-900">
									{row.conv}
								</td>
								<td className="px-4 py-3 font-semibold text-emerald-700">
									{row.rev}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
