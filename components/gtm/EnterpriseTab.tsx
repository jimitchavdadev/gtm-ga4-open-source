"use client";

import { useState } from "react";

interface EnterpriseTabProps {
	containerId: string;
}

export function EnterpriseTab({ containerId }: EnterpriseTabProps) {
	const [approved, setApproved] = useState(false);
	const [rejected, setRejected] = useState(false);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold text-gray-900">GTM 360 Enterprise Governance</h2>
						<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold uppercase text-blue-700">
							360 Tier
						</span>
					</div>
					<p className="mt-1 text-sm text-gray-500">
						Container Zones, Multi-Stage Approval Workflows, and Custom Environments
					</p>
				</div>
			</div>

			{/* Container Zones */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Container Zones (360)</h3>
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
								<td className="px-4 py-3 font-semibold text-gray-900">Marketing Agency Zone</td>
								<td className="px-4 py-3 font-mono text-xs text-blue-600">GTM-MKTG999</td>
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
								<td className="px-4 py-3 font-semibold text-gray-900">EU GDPR Zone</td>
								<td className="px-4 py-3 font-mono text-xs text-blue-600">GTM-EU444</td>
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

			{/* Approval Workflows */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Multi-Stage Approvals (360)</h3>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Workspace / Request</th>
								<th className="px-4 py-3">Author</th>
								<th className="px-4 py-3">Review Status</th>
								<th className="px-4 py-3">Stage</th>
								<th className="px-4 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							<tr className="hover:bg-gray-50">
								<td className="px-4 py-3">
									<div className="font-semibold text-gray-900">Q4 Conversion Tracking Overhaul</div>
									<div className="text-xs text-gray-500">Added enhanced ecommerce & Google Ads tags</div>
								</td>
								<td className="px-4 py-3 text-xs text-gray-700">dev-lead@company.com</td>
								<td className="px-4 py-3">
									{approved ? (
										<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
											Approved & Ready
										</span>
									) : rejected ? (
										<span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
											Changes Requested
										</span>
									) : (
										<span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
											Pending Security Review
										</span>
									)}
								</td>
								<td className="px-4 py-3 text-xs text-gray-500">Stage 2 of 2</td>
								<td className="px-4 py-3 text-right">
									{!approved && !rejected && (
										<div className="flex justify-end gap-2">
											<button
												type="button"
												onClick={() => setApproved(true)}
												className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
											>
												Approve
											</button>
											<button
												type="button"
												onClick={() => setRejected(true)}
												className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
											>
												Reject
											</button>
										</div>
									)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Custom Environments */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Environments</h3>
				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="rounded-lg border border-gray-200 p-4">
						<div className="flex items-center justify-between">
							<strong className="text-sm text-gray-900">Live / Production</strong>
							<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
								Live Snippet
							</span>
						</div>
						<code className="mt-3 block overflow-x-auto rounded-md bg-gray-100 p-2 font-mono text-xs text-gray-800">
							/gtm.js?id={containerId}
						</code>
					</div>

					<div className="rounded-lg border border-gray-200 p-4">
						<div className="flex items-center justify-between">
							<strong className="text-sm text-gray-900">Staging (Authenticated)</strong>
							<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
								gtm_auth Token
							</span>
						</div>
						<code className="mt-3 block overflow-x-auto rounded-md bg-gray-100 p-2 font-mono text-xs text-gray-800">
							/gtm.js?id={containerId}&gtm_auth=sec_99a8b1&gtm_preview=env_2
						</code>
					</div>
				</div>
			</div>
		</div>
	);
}
