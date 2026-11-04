"use client";

export function ContainerZonesTable() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<h3 className="text-base font-bold text-gray-900">
				Container Zones (360)
			</h3>
			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left text-sm text-gray-600">
					<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
						<tr>
							<th className="px-4 py-3">Zone Name</th>
							<th className="px-4 py-3">Child Container</th>
							<th className="px-4 py-3">Boundary Rule</th>
							<th className="px-4 py-3">Type Restrictions</th>
							<th className="px-4 py-3">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						<tr className="hover:bg-gray-50">
							<td className="px-4 py-3 font-semibold text-gray-900">
								Marketing Agency Zone
							</td>
							<td className="px-4 py-3 font-mono text-xs text-blue-600">
								GTM-MKTG999
							</td>
							<td className="px-4 py-3">
								URL matches <code className="text-xs">/campaigns/*</code>
							</td>
							<td className="px-4 py-3">
								<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
									Google Ads, Floodlight
								</span>
							</td>
							<td className="px-4 py-3">
								<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
									Active
								</span>
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="px-4 py-3 font-semibold text-gray-900">
								EU GDPR Zone
							</td>
							<td className="px-4 py-3 font-mono text-xs text-blue-600">
								GTM-EU444
							</td>
							<td className="px-4 py-3">
								Country equals <code className="text-xs">DE, FR, IT</code>
							</td>
							<td className="px-4 py-3">
								<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
									Consent Enforced
								</span>
							</td>
							<td className="px-4 py-3">
								<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
									Active
								</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
