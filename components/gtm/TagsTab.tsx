"use client";

import { useState } from "react";

interface TagsTabProps {
	tags: any[];
	onCreateTag: (name: string, data: any) => Promise<void>;
	onDeleteTag: (id: string) => Promise<void>;
}

export function TagsTab({ tags, onCreateTag, onDeleteTag }: TagsTabProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [name, setName] = useState("GA4 Event Tag");
	const [type, setType] = useState("GA4_EVENT");
	const [triggerName, setTriggerName] = useState("All Pages");
	const [priority, setPriority] = useState(10);
	const [requiredConsent, setRequiredConsent] = useState("analytics_storage");

	const handleSave = async () => {
		await onCreateTag(name, { type, triggerName, priority, requiredConsent });
		setIsModalOpen(false);
	};

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold text-gray-900">Tags</h2>
						<p className="mt-1 text-sm text-gray-500">
							Tags execute code or send measurement hits to third-party endpoints
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700"
					>
						+ New Tag
					</button>
				</div>

				<div className="mt-6 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Tag Name</th>
								<th className="px-4 py-3">Type</th>
								<th className="px-4 py-3">Firing Trigger</th>
								<th className="px-4 py-3">Priority</th>
								<th className="px-4 py-3">Consent</th>
								<th className="px-4 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{tags.length === 0 ? (
								<tr>
									<td colSpan={6} className="py-6 text-center text-gray-400">
										No tags created yet. Click "+ New Tag" to create one.
									</td>
								</tr>
							) : (
								tags.map((t) => {
									const data = JSON.parse(t.data_json || "{}");
									return (
										<tr key={t.id} className="hover:bg-gray-50">
											<td className="px-4 py-3 font-semibold text-gray-900">{t.name}</td>
											<td className="px-4 py-3">
												<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
													{data.type || "GA4_EVENT"}
												</span>
											</td>
											<td className="px-4 py-3 text-gray-700">{data.triggerName || "All Pages"}</td>
											<td className="px-4 py-3 font-mono text-xs">{data.priority || 0}</td>
											<td className="px-4 py-3">
												<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
													{data.requiredConsent || "analytics_storage"}
												</span>
											</td>
											<td className="px-4 py-3 text-right">
												<button
													type="button"
													onClick={() => onDeleteTag(t.id)}
													className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
												>
													Delete
												</button>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
					<div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
						<h3 className="text-lg font-bold text-gray-900">Create New Tag</h3>
						<div className="mt-4 space-y-4">
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Tag Name</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Tag Type</label>
								<select
									value={type}
									onChange={(e) => setType(e.target.value)}
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								>
									<option value="GA4_EVENT">Google Analytics: GA4 Event</option>
									<option value="GA4_CONFIG">Google Tag / GA4 Configuration</option>
									<option value="CUSTOM_HTML">Custom HTML</option>
									<option value="GOOGLE_ADS">Google Ads Conversion Tracking</option>
								</select>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Firing Trigger</label>
								<select
									value={triggerName}
									onChange={(e) => setTriggerName(e.target.value)}
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								>
									<option value="All Pages">Initialization - All Pages</option>
									<option value="Purchase Event">Custom Event - purchase</option>
									<option value="Click Links">Just Links Click</option>
								</select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-semibold uppercase text-gray-600">Priority</label>
									<input
										type="number"
										value={priority}
										onChange={(e) => setPriority(Number(e.target.value))}
										className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold uppercase text-gray-600">Consent</label>
									<select
										value={requiredConsent}
										onChange={(e) => setRequiredConsent(e.target.value)}
										className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
									>
										<option value="analytics_storage">analytics_storage</option>
										<option value="ad_storage">ad_storage</option>
										<option value="ad_user_data">ad_user_data</option>
										<option value="ad_personalization">ad_personalization</option>
									</select>
								</div>
							</div>
						</div>
						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleSave}
								className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
							>
								Save Tag
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
