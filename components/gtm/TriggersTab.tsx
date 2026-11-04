"use client";

import { useState } from "react";
import { TriggerCreateModal } from "./TriggerCreateModal";

interface TriggersTabProps {
	triggers: any[];
	onCreateTrigger: (
		name: string,
		type: string,
		filterRule: any,
	) => Promise<void>;
	onDeleteTrigger: (id: string) => Promise<void>;
}

export function TriggersTab({
	triggers,
	onCreateTrigger,
	onDeleteTrigger,
}: TriggersTabProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSave = async (name: string, type: string, condition: string) => {
		await onCreateTrigger(name, type, { condition: condition || "all_pages" });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">Firing Triggers</h2>
					<p className="mt-1 text-sm text-gray-500">
						Triggers evaluate at runtime in response to dataLayer events, DOM
						actions, and history changes
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

			<div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-6 py-3">Trigger Name</th>
								<th className="px-6 py-3">Event Type</th>
								<th className="px-6 py-3">Filter Conditions</th>
								<th className="px-6 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{triggers.length === 0 ? (
								<tr>
									<td colSpan={4} className="py-6 text-center text-gray-400">
										No triggers created yet. Click "+ New Trigger" to create
										one.
									</td>
								</tr>
							) : (
								triggers.map((tr) => {
									let dataObj: any = {};
									try {
										dataObj = JSON.parse(tr.data_json || "{}");
									} catch {}
									return (
										<tr key={tr.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 font-semibold text-gray-900">
												{tr.name}
											</td>
											<td className="px-6 py-4">
												<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
													{tr.type}
												</span>
											</td>
											<td className="px-6 py-4 text-xs font-mono text-gray-500">
												{JSON.stringify(dataObj.condition || dataObj)}
											</td>
											<td className="px-6 py-4 text-right">
												<button
													type="button"
													onClick={() => onDeleteTrigger(tr.id)}
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

			<TriggerCreateModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSave}
			/>
		</div>
	);
}
