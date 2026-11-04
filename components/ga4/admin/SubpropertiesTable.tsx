"use client";

export function SubpropertiesTable() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<div className="flex items-center gap-2">
				<h3 className="text-base font-bold text-gray-900">
					360 Subproperties & Roll-up Properties
				</h3>
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
							<th className="px-4 py-3">Filter Expression</th>
							<th className="px-4 py-3">Event Multiplier</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						<tr className="hover:bg-gray-50">
							<td className="px-4 py-3 font-semibold text-gray-900">
								EMEA Brand Subproperty
							</td>
							<td className="px-4 py-3">
								<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
									Subproperty
								</span>
							</td>
							<td className="px-4 py-3 font-mono text-xs">
								geo_country IN (&apos;GB&apos;, &apos;DE&apos;, &apos;FR&apos;)
							</td>
							<td className="px-4 py-3 text-xs text-gray-500">
								0.5x event cost
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="px-4 py-3 font-semibold text-gray-900">
								Global Enterprise Roll-Up
							</td>
							<td className="px-4 py-3">
								<span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
									Roll-up
								</span>
							</td>
							<td className="px-4 py-3 font-mono text-xs">
								Source: Production + EMEA + Mobile Apps
							</td>
							<td className="px-4 py-3 text-xs text-gray-500">
								Combined reporting
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
