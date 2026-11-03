"use client";

export function AudiencesTab() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold text-gray-900">Audiences & Predictive Segments</h2>
						<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold uppercase text-blue-700">
							Machine Learning
						</span>
					</div>
					<p className="mt-1 text-sm text-gray-500">
						Segment users based on behavior, dimensions, and predictive purchase models
					</p>
				</div>
			</div>

			{/* Predictive ML Cards */}
			<div className="rounded-xl border border-gray-200 border-t-4 border-t-blue-600 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Predictive Machine Learning Templates</h3>
				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-lg border border-gray-200 p-4">
						<div className="flex items-center justify-between">
							<strong className="text-sm text-gray-900">Likely 7-day purchasers</strong>
							<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
								Ready
							</span>
						</div>
						<p className="mt-2 text-xs text-gray-500">
							Users with high likelihood to purchase in the next 7 days based on ML engagement patterns.
						</p>
						<div className="mt-4 text-xs font-semibold text-gray-800">
							Estimated Size: <strong className="text-blue-600">140 users</strong>
						</div>
					</div>

					<div className="rounded-lg border border-gray-200 p-4">
						<div className="flex items-center justify-between">
							<strong className="text-sm text-gray-900">Likely 7-day churning users</strong>
							<span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
								Targeting
							</span>
						</div>
						<p className="mt-2 text-xs text-gray-500">
							Active users unlikely to return in the next 7 days. Ideal for automated win-back retention.
						</p>
						<div className="mt-4 text-xs font-semibold text-gray-800">
							Estimated Size: <strong className="text-blue-600">85 users</strong>
						</div>
					</div>

					<div className="rounded-lg border border-gray-200 p-4">
						<div className="flex items-center justify-between">
							<strong className="text-sm text-gray-900">Predicted 28-day top spenders</strong>
							<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
								VIP
							</span>
						</div>
						<p className="mt-2 text-xs text-gray-500">
							Users predicted to generate the top 20% of revenue in the next 28 days.
						</p>
						<div className="mt-4 text-xs font-semibold text-gray-800">
							Estimated Size: <strong className="text-blue-600">55 users</strong>
						</div>
					</div>
				</div>
			</div>

			{/* Active Audiences Table */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Configured Audiences</h3>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Audience Name</th>
								<th className="px-4 py-3">Description</th>
								<th className="px-4 py-3">Duration</th>
								<th className="px-4 py-3">Audience Trigger</th>
								<th className="px-4 py-3">Users Count</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">All Users</td>
								<td className="px-4 py-3 text-xs text-gray-500">Default audience containing all active visitors</td>
								<td className="px-4 py-3 text-xs">30 days</td>
								<td className="px-4 py-3 font-mono text-xs text-gray-400">-</td>
								<td className="px-4 py-3 font-bold text-gray-900">650</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">Purchasers</td>
								<td className="px-4 py-3 text-xs text-gray-500">Users who have triggered a purchase key event</td>
								<td className="px-4 py-3 text-xs">90 days</td>
								<td className="px-4 py-3 font-mono text-xs text-blue-600">vip_member_created</td>
								<td className="px-4 py-3 font-bold text-gray-900">73</td>
							</tr>
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3 font-semibold text-gray-900">Cart Abandoners</td>
								<td className="px-4 py-3 text-xs text-gray-500">Users who added to cart without completing purchase</td>
								<td className="px-4 py-3 text-xs">30 days</td>
								<td className="px-4 py-3 font-mono text-xs text-blue-600">cart_abandoned_trigger</td>
								<td className="px-4 py-3 font-bold text-gray-900">112</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
