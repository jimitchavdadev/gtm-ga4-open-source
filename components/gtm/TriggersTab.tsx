"use client";

import { useState } from "react";

interface TriggersTabProps {
	triggers: any[];
	onCreateTrigger: (name: string, data: any) => Promise<void>;
	onDeleteTrigger: (id: string) => Promise<void>;
}

export function TriggersTab({
	triggers,
	onCreateTrigger,
	onDeleteTrigger,
}: TriggersTabProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [name, setName] = useState("Custom Event Trigger");
	const [type, setType] = useState("CUSTOM_EVENT");
	const [condition, setCondition] = useState("event equals purchase");

	const handleSave = async () => {
		await onCreateTrigger(name, { type, condition });
		setIsModalOpen(false);
	};

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold text-gray-900">Triggers</h2>
						<p className="mt-1 text-sm text-gray-500">
							Triggers evaluate in response to events and determine when tags fire
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700"
					>
						+ New Trigger
					</button>
				</div>

				<div className="mt-6 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Trigger Name</th>
								<th className="px-4 py-3">Type</th>
								<th className="px-4 py-3">Conditions</th>
								<th className="px-4 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{triggers.length === 0 ? (
								<tr>
									<td colSpan={4} className="py-6 text-center text-gray-400">
										No triggers created yet. Click "+ New Trigger" to create one.
									</td>
								</tr>
							) : (
								triggers.map((t) => {
									const data = JSON.parse(t.data_json || "{}");
									return (
										<tr key={t.id} className="hover:bg-gray-50">
											<td className="px-4 py-3 font-semibold text-gray-900">{t.name}</td>
											<td className="px-4 py-3">
												<span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
													{data.type || "PAGEVIEW"}
												</span>
											</td>
											<td className="px-4 py-3 text-gray-700">{data.condition || "All Events"}</td>
											<td className="px-4 py-3 text-right">
												<button
													type="button"
													onClick={() => onDeleteTrigger(t.id)}
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
					<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
						<h3 className="text-lg font-bold text-gray-900">Create New Trigger</h3>
						<div className="mt-4 space-y-4">
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Trigger Name</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Trigger Type</label>
								<select
									value={type}
									onChange={(e) => setType(e.target.value)}
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								>
									<option value="CUSTOM_EVENT">Custom Event</option>
									<option value="PAGEVIEW">Page View</option>
									<option value="DOM_READY">DOM Ready</option>
									<option value="CLICK">Click - All Elements</option>
									<option value="TRIGGER_GROUP">Trigger Group</option>
								</select>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Condition Filter</label>
								<input
									type="text"
									value={condition}
									onChange={(e) => setCondition(e.target.value)}
									placeholder="e.g. event equals purchase"
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								/>
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
								Save Trigger
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
