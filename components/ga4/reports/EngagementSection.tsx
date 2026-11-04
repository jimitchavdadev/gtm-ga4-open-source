"use client";

export function EngagementSection() {
	const rows = [
		{
			name: "page_view",
			count: "1,420",
			users: 650,
			perUser: 2.18,
			isKey: false,
		},
		{
			name: "session_start",
			count: "890",
			users: 650,
			perUser: 1.37,
			isKey: false,
		},
		{
			name: "view_item",
			count: "410",
			users: 280,
			perUser: 1.46,
			isKey: false,
		},
		{
			name: "add_to_cart",
			count: "185",
			users: 140,
			perUser: 1.32,
			isKey: false,
		},
		{
			name: "purchase",
			count: "73",
			users: 68,
			perUser: 1.07,
			isKey: true,
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<h3 className="text-base font-bold text-gray-900">
				Events & Conversions
			</h3>
			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left text-sm text-gray-600">
					<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
						<tr>
							<th className="px-4 py-3">Event Name</th>
							<th className="px-4 py-3">Event Count</th>
							<th className="px-4 py-3">Total Users</th>
							<th className="px-4 py-3">Per User</th>
							<th className="px-4 py-3">Key Event</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((row) => (
							<tr key={row.name} className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">
									{row.name}
								</td>
								<td className="px-4 py-3 font-mono">{row.count}</td>
								<td className="px-4 py-3">{row.users}</td>
								<td className="px-4 py-3">{row.perUser}</td>
								<td className="px-4 py-3">
									{row.isKey ? (
										<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
											Key Event
										</span>
									) : (
										<span className="text-gray-400">No</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
