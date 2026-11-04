"use client";

export function CustomDefinitionsTable() {
	const definitions = [
		{
			name: "Customer Tier",
			scope: "User Scoped",
			scopeBadge: "bg-blue-50 text-blue-700",
			param: "customer_tier",
			quota: "1 / 100 used (360)",
		},
		{
			name: "Blog Author",
			scope: "Event Scoped",
			scopeBadge: "bg-amber-50 text-amber-700",
			param: "author_name",
			quota: "1 / 125 used (360)",
		},
		{
			name: "Average Order Value (AOV)",
			scope: "Calculated Metric",
			scopeBadge: "bg-emerald-50 text-emerald-700",
			param: "{value} / {purchases}",
			quota: "1 / 50 used (360)",
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<h3 className="text-base font-bold text-gray-900">
				Custom Definitions (Free & 360 Limits)
			</h3>
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
						{definitions.map((d) => (
							<tr key={d.name} className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">
									{d.name}
								</td>
								<td className="px-4 py-3">
									<span
										className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.scopeBadge}`}
									>
										{d.scope}
									</span>
								</td>
								<td className="px-4 py-3 font-mono text-xs">{d.param}</td>
								<td className="px-4 py-3 text-xs text-gray-500">{d.quota}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
