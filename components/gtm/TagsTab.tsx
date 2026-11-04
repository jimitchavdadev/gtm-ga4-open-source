"use client";

import { useState } from "react";
import { TagCreateModal } from "./TagCreateModal";

interface TagsTabProps {
	tags: any[];
	onCreateTag: (
		name: string,
		type: string,
		data: any,
		priority: number,
		consent: string,
	) => Promise<void>;
	onDeleteTag: (id: string) => Promise<void>;
}

export function TagsTab({ tags, onCreateTag, onDeleteTag }: TagsTabProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSaveTag = async (
		name: string,
		type: string,
		triggerName: string,
		priority: number,
		requiredConsent: string,
	) => {
		await onCreateTag(
			name,
			type,
			{ trigger: triggerName, measurement_id: "G-TESTSTREAM" },
			priority,
			requiredConsent,
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">Tags</h2>
					<p className="mt-1 text-sm text-gray-500">
						Tags are segments of code that execute on your digital properties
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

			<div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-6 py-3">Tag Name</th>
								<th className="px-6 py-3">Type</th>
								<th className="px-6 py-3">Firing Triggers</th>
								<th className="px-6 py-3">Priority</th>
								<th className="px-6 py-3">Consent Check</th>
								<th className="px-6 py-3 text-right">Actions</th>
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
									let dataObj: any = {};
									try {
										dataObj = JSON.parse(t.data_json || "{}");
									} catch {}
									return (
										<tr key={t.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 font-semibold text-gray-900">
												{t.name}
											</td>
											<td className="px-6 py-4">
												<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
													{t.type}
												</span>
											</td>
											<td className="px-6 py-4 text-xs text-gray-500">
												{dataObj.trigger || "All Pages"}
											</td>
											<td className="px-6 py-4 font-mono text-xs text-gray-700">
												{t.priority ?? 0}
											</td>
											<td className="px-6 py-4">
												<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
													{dataObj.consent || "analytics_storage"}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
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

			<TagCreateModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveTag}
			/>
		</div>
	);
}
