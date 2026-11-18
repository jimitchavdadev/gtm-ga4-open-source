"use client";

export function CohortForm() {
	const cohorts = [
		{
			label: "Nov 1 - Nov 7",
			size: "2,450",
			d0: "100%",
			d1: "38.2%",
			d2: "24.5%",
			d3: "18.9%",
			d4: "15.2%",
		},
		{
			label: "Nov 8 - Nov 14",
			size: "2,680",
			d0: "100%",
			d1: "41.0%",
			d2: "26.8%",
			d3: "20.1%",
			d4: "16.4%",
		},
		{
			label: "Nov 15 - Nov 21",
			size: "2,890",
			d0: "100%",
			d1: "43.5%",
			d2: "28.2%",
			d3: "22.0%",
			d4: "-",
		},
		{
			label: "Nov 22 - Nov 28",
			size: "3,120",
			d0: "100%",
			d1: "44.8%",
			d2: "29.4%",
			d3: "-",
			d4: "-",
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div>
					<h3 className="text-base font-bold text-gray-900">
						Cohort Exploration (Retention Matrix)
					</h3>
					<p className="mt-0.5 text-xs text-gray-500">
						Track user return activity and retention across rolling weekly
						cohorts
					</p>
				</div>
				<span className="text-xs text-gray-500">
					Inclusion: <strong className="text-gray-900">Any Transaction</strong>
				</span>
			</div>

			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left text-sm text-gray-600">
					<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
						<tr>
							<th className="px-4 py-3">Cohort</th>
							<th className="px-4 py-3">Users</th>
							<th className="px-4 py-3">Week 0</th>
							<th className="px-4 py-3">Week 1</th>
							<th className="px-4 py-3">Week 2</th>
							<th className="px-4 py-3">Week 3</th>
							<th className="px-4 py-3">Week 4</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{cohorts.map((c) => (
							<tr key={c.label} className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">
									{c.label}
								</td>
								<td className="px-4 py-3 font-mono text-xs">{c.size}</td>
								<td className="px-4 py-3 font-bold text-blue-700 bg-blue-50/50">
									{c.d0}
								</td>
								<td className="px-4 py-3 text-emerald-700 font-medium">
									{c.d1}
								</td>
								<td className="px-4 py-3 text-emerald-700 font-medium">
									{c.d2}
								</td>
								<td className="px-4 py-3 text-gray-700">{c.d3}</td>
								<td className="px-4 py-3 text-gray-700">{c.d4}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
