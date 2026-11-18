"use client";

export function UserLifetimeForm() {
	const rows = [
		{
			channel: "Paid Search",
			users: "3,120",
			ltv: "$184.50",
			rev: "$575,640",
			purchases: "4,820",
			engMins: "28.4",
		},
		{
			channel: "Organic Search",
			users: "4,680",
			ltv: "$142.00",
			rev: "$664,560",
			purchases: "5,910",
			engMins: "34.1",
		},
		{
			channel: "Email Marketing",
			users: "1,450",
			ltv: "$210.80",
			rev: "$305,660",
			purchases: "2,740",
			engMins: "41.6",
		},
		{
			channel: "Direct",
			users: "2,200",
			ltv: "$115.20",
			rev: "$253,440",
			purchases: "2,410",
			engMins: "19.8",
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div>
					<h3 className="text-base font-bold text-gray-900">
						User Lifetime (LTV Exploration)
					</h3>
					<p className="mt-0.5 text-xs text-gray-500">
						Cumulative customer value and transaction behavior by first
						acquisition channel
					</p>
				</div>
				<div className="text-right">
					<div className="text-xs text-gray-500">Average Lifetime Value</div>
					<div className="text-lg font-bold text-emerald-600">$156.40</div>
				</div>
			</div>

			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left text-sm text-gray-600">
					<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
						<tr>
							<th className="px-4 py-3">First User Acquisition Channel</th>
							<th className="px-4 py-3">Acquired Users</th>
							<th className="px-4 py-3">Lifetime Value (LTV)</th>
							<th className="px-4 py-3">Lifetime Revenue</th>
							<th className="px-4 py-3">Lifetime Transactions</th>
							<th className="px-4 py-3">Avg Engagement (mins)</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((r) => (
							<tr key={r.channel} className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">
									{r.channel}
								</td>
								<td className="px-4 py-3">{r.users}</td>
								<td className="px-4 py-3 font-bold text-emerald-700">
									{r.ltv}
								</td>
								<td className="px-4 py-3 font-semibold text-gray-900">
									{r.rev}
								</td>
								<td className="px-4 py-3">{r.purchases}</td>
								<td className="px-4 py-3 text-gray-500">{r.engMins}m</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
