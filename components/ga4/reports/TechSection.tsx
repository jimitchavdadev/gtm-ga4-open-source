"use client";

export function TechSection() {
	const rows = [
		{
			device: "Desktop",
			os: "Linux, macOS, Windows",
			users: 580,
			rate: "78.2%",
		},
		{
			device: "Mobile",
			os: "Android, iOS",
			users: 260,
			rate: "65.4%",
		},
		{
			device: "Tablet",
			os: "iPadOS, Android Tablet",
			users: 50,
			rate: "62.0%",
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<h3 className="text-base font-bold text-gray-900">
				Users by Device Category
			</h3>
			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left text-sm text-gray-600">
					<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
						<tr>
							<th className="px-4 py-3">Device Category</th>
							<th className="px-4 py-3">Operating Systems</th>
							<th className="px-4 py-3">Active Users</th>
							<th className="px-4 py-3">Engagement Rate</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((row) => (
							<tr key={row.device} className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">
									{row.device}
								</td>
								<td className="px-4 py-3 text-xs text-gray-500">{row.os}</td>
								<td className="px-4 py-3 font-bold text-gray-900">
									{row.users}
								</td>
								<td className="px-4 py-3 font-medium text-emerald-600">
									{row.rate}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
