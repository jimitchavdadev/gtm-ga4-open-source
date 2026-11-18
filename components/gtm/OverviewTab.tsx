"use client";

import { useState } from "react";
import { PublishModal } from "./PublishModal";

interface OverviewTabProps {
	tagsCount: number;
	triggersCount: number;
	variablesCount: number;
	versions: any[];
	onPublish: (name: string, desc: string) => Promise<void>;
	onOpenDiagnostics?: () => void;
}

export function OverviewTab({
	tagsCount,
	triggersCount,
	variablesCount,
	versions,
	onPublish,
	onOpenDiagnostics,
}: OverviewTabProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-gray-200 border-t-4 border-t-blue-600 bg-white p-6 shadow-xs">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold text-gray-900">
							Default Workspace
						</h2>
						<p className="mt-1 text-sm text-gray-500">
							Active container workspace with unsubmitted configurations
						</p>
					</div>
					<div className="flex items-center gap-3">
						{onOpenDiagnostics && (
							<button
								type="button"
								onClick={onOpenDiagnostics}
								className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
							>
								<span>🩺</span>
								<span>Tag Diagnostics</span>
							</button>
						)}
						<button
							type="button"
							onClick={() => setIsModalOpen(true)}
							className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700"
						>
							Publish Workspace
						</button>
					</div>
				</div>

				<div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
					<div className="rounded-lg bg-gray-50 p-4 text-center">
						<div className="text-2xl font-bold text-gray-900">{tagsCount}</div>
						<div className="text-xs font-medium text-gray-500">Active Tags</div>
					</div>
					<div className="rounded-lg bg-gray-50 p-4 text-center">
						<div className="text-2xl font-bold text-gray-900">
							{triggersCount}
						</div>
						<div className="text-xs font-medium text-gray-500">Triggers</div>
					</div>
					<div className="rounded-lg bg-gray-50 p-4 text-center">
						<div className="text-2xl font-bold text-gray-900">
							{variablesCount}
						</div>
						<div className="text-xs font-medium text-gray-500">Variables</div>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">
					Container Version History
				</h3>
				<div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Version</th>
								<th className="px-4 py-3">Name</th>
								<th className="px-4 py-3">Description</th>
								<th className="px-4 py-3">Created</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{versions.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="px-4 py-6 text-center text-gray-400"
									>
										No versions published yet. Publish your first version above.
									</td>
								</tr>
							) : (
								versions.map((v) => (
									<tr key={v.id} className="hover:bg-gray-50/50">
										<td className="px-4 py-3 font-mono font-bold text-blue-600">
											v{v.version_number}
										</td>
										<td className="px-4 py-3 font-medium text-gray-800">
											{v.name || "Untitled"}
										</td>
										<td className="px-4 py-3 text-gray-500">
											{v.description || "-"}
										</td>
										<td className="px-4 py-3 text-xs text-gray-500">
											{new Date(v.created_at).toLocaleString()}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<PublishModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onPublish={onPublish}
			/>
		</div>
	);
}
