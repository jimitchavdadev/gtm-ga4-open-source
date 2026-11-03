"use client";

export function FunnelTab() {
	const funnelSteps = [
		{ name: "1. View Item (Product Details)", users: 1000, pct: 100, dropPct: 0 },
		{ name: "2. Add to Cart", users: 450, pct: 45.0, dropPct: 55.0 },
		{ name: "3. Begin Checkout", users: 220, pct: 22.0, dropPct: 51.1 },
		{ name: "4. Purchase (Key Event)", users: 140, pct: 14.0, dropPct: 36.4 },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">Explore: Funnel Exploration</h2>
					<p className="mt-1 text-sm text-gray-500">
						Multi-step checkout journey completion and abandonment analysis
					</p>
				</div>
				<div className="text-sm text-gray-500">
					Overall Funnel Conversion Rate:{" "}
					<strong className="text-lg font-bold text-emerald-600">14.0%</strong>
				</div>
			</div>

			{/* Visual Bars */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Ecommerce Checkout Journey</h3>
				<div className="mt-6 space-y-6">
					{funnelSteps.map((s) => (
						<div key={s.name}>
							<div className="flex justify-between text-xs font-semibold text-gray-800">
								<span>{s.name}</span>
								<span>
									<strong>{s.users.toLocaleString()}</strong> users ({s.pct.toFixed(1)}%)
								</span>
							</div>
							<div className="mt-2 h-7 w-full overflow-hidden rounded-md bg-gray-100">
								<div
									className="h-full rounded-md bg-linear-to-r from-blue-600 to-indigo-500 transition-all duration-300"
									style={{ width: `${s.pct}%` }}
								/>
							</div>
							{s.dropPct > 0 && (
								<div className="mt-1 text-xs text-red-600">
									&darr; Drop-off: {s.dropPct.toFixed(1)}% (
									{(s.users / (s.pct / 100) - s.users).toFixed(0)} users abandoned)
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Funnel Metrics Table */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Step-by-Step Drop-off Metrics</h3>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Funnel Step</th>
								<th className="px-4 py-3">Active Users</th>
								<th className="px-4 py-3">Completion Rate</th>
								<th className="px-4 py-3">Drop-offs</th>
								<th className="px-4 py-3">Abandonment Rate</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{funnelSteps.map((s) => (
								<tr key={s.name} className="hover:bg-gray-50">
									<td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
									<td className="px-4 py-3">{s.users.toLocaleString()}</td>
									<td className="px-4 py-3">
										<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
											{s.pct.toFixed(1)}%
										</span>
									</td>
									<td className="px-4 py-3">
										{s.dropPct > 0 ? (s.users * (s.dropPct / 100)).toFixed(0) : "0"}
									</td>
									<td className="px-4 py-3">
										{s.dropPct > 0 ? (
											<span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
												{s.dropPct.toFixed(1)}%
											</span>
										) : (
											"-"
										)}
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
