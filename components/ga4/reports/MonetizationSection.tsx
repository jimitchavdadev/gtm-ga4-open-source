"use client";

export function MonetizationSection() {
	const rows = [
		{
			name: "Pro Analytics Cloud",
			views: 340,
			cart: 95,
			rate: "27.9%",
			purch: 42,
			rev: "$4,158.00",
		},
		{
			name: "Enterprise Self-Hosted License",
			views: 180,
			cart: 45,
			rate: "25.0%",
			purch: 21,
			rev: "$10,479.00",
		},
		{
			name: "Developer Support Plan",
			views: 120,
			cart: 32,
			rate: "26.7%",
			purch: 10,
			rev: "$990.00",
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<h3 className="text-base font-bold text-gray-900">
				Ecommerce Purchases & Items Revenue
			</h3>
			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left text-sm text-gray-600">
					<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
						<tr>
							<th className="px-4 py-3">Item Name</th>
							<th className="px-4 py-3">Views</th>
							<th className="px-4 py-3">Cart Adds</th>
							<th className="px-4 py-3">Cart-to-View</th>
							<th className="px-4 py-3">Purchases</th>
							<th className="px-4 py-3">Revenue</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{rows.map((row) => (
							<tr key={row.name} className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">
									{row.name}
								</td>
								<td className="px-4 py-3">{row.views}</td>
								<td className="px-4 py-3">{row.cart}</td>
								<td className="px-4 py-3 font-medium text-blue-600">
									{row.rate}
								</td>
								<td className="px-4 py-3 font-bold text-gray-900">
									{row.purch}
								</td>
								<td className="px-4 py-3 font-semibold text-emerald-600">
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
