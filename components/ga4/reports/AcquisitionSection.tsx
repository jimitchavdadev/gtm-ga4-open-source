"use client";

export function AcquisitionSection() {
	const rows = [
		{
			channel: "Organic Search",
			users: 412,
			sessions: 520,
			engaged: 390,
			rate: "75.0%",
			conv: 18,
		},
		{
			channel: "Direct",
			users: 280,
			sessions: 310,
			engaged: 215,
			rate: "69.4%",
			conv: 12,
		},
		{
			channel: "Paid Search (Google Ads)",
			users: 195,
			sessions: 240,
			engaged: 185,
			rate: "77.1%",
			conv: 24,
		},
		{
			channel: "Email Marketing",
			users: 110,
			sessions: 145,
			engaged: 120,
			rate: "82.8%",
			conv: 15,
		},
		{
			channel: "Referral",
			users: 65,
			sessions: 78,
			engaged: 52,
			rate: "66.7%",
			conv: 4,
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<h3 className="text-base font-bold text-gray-900">
				Traffic Acquisition by Session Default Channel Group
			</h3>
			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left text-sm text-gray-600">
					<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
						<tr>
							<th className="px-4 py-3">Channel Group</th>
							<th className="px-4 py-3">Users</th>
							<th className="px-4 py-3">Sessions</th>
							<th className="px-4 py-3">Engaged Sessions</th>
							<th className="px-4 py-3">Engagement Rate</th>
							<th className="px-4 py-3">Conversions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((row) => (
							<tr key={row.channel} className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">
									{row.channel}
								</td>
								<td className="px-4 py-3">{row.users}</td>
								<td className="px-4 py-3">{row.sessions}</td>
								<td className="px-4 py-3">{row.engaged}</td>
								<td className="px-4 py-3 font-medium text-emerald-600">
									{row.rate}
								</td>
								<td className="px-4 py-3 font-bold text-gray-900">
									{row.conv}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
