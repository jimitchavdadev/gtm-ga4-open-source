"use client";

import { useState } from "react";

interface OverviewTabProps {
	tagsCount: number;
	triggersCount: number;
	variablesCount: number;
	versions: any[];
	onPublish: (name: string, desc: string) => Promise<void>;
}

export function OverviewTab({
	tagsCount,
	triggersCount,
	variablesCount,
	versions,
	onPublish,
}: OverviewTabProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [verName, setVerName] = useState(`Release v${versions.length + 1}`);
	const [verDesc, setVerDesc] = useState("");
	const [publishing, setPublishing] = useState(false);

	const handlePublish = async () => {
		setPublishing(true);
		await onPublish(verName, verDesc);
		setPublishing(false);
		setIsModalOpen(false);
	};

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-gray-200 border-t-4 border-t-blue-600 bg-white p-6 shadow-xs">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold text-gray-900">Default Workspace</h2>
						<p className="mt-1 text-sm text-gray-500">
							Active container workspace with unsubmitted configurations
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700"
					>
						Publish to Live
					</button>
				</div>

				<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-lg border border-gray-200 border-l-4 border-l-blue-600 bg-white p-4">
						<div className="text-xs font-semibold uppercase text-gray-500">Configured Tags</div>
						<div className="mt-1 text-3xl font-bold text-gray-900">{tagsCount}</div>
					</div>
					<div className="rounded-lg border border-gray-200 border-l-4 border-l-emerald-600 bg-white p-4">
						<div className="text-xs font-semibold uppercase text-gray-500">Firing Triggers</div>
						<div className="mt-1 text-3xl font-bold text-gray-900">{triggersCount}</div>
					</div>
					<div className="rounded-lg border border-gray-200 border-l-4 border-l-amber-500 bg-white p-4">
						<div className="text-xs font-semibold uppercase text-gray-500">Variables & Macros</div>
						<div className="mt-1 text-3xl font-bold text-gray-900">{variablesCount}</div>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-lg font-bold text-gray-900">Published Container Versions</h3>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Version</th>
								<th className="px-4 py-3">Name</th>
								<th className="px-4 py-3">Description</th>
								<th className="px-4 py-3">Published At</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{versions.length === 0 ? (
								<tr>
									<td colSpan={4} className="py-6 text-center text-gray-400">
										No versions published yet. Click "Publish to Live" above.
									</td>
								</tr>
							) : (
								versions.map((v) => (
									<tr key={v.id} className="hover:bg-gray-50">
										<td className="px-4 py-3 font-bold text-gray-900">v{v.version_number}</td>
										<td className="px-4 py-3 font-medium text-gray-800">{v.name || "Untitled"}</td>
										<td className="px-4 py-3 text-gray-500">{v.description || "-"}</td>
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

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
						<h3 className="text-lg font-bold text-gray-900">Publish Container Version</h3>
						<div className="mt-4 space-y-4">
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Version Name</label>
								<input
									type="text"
									value={verName}
									onChange={(e) => setVerName(e.target.value)}
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">
									Version Description
								</label>
								<textarea
									rows={3}
									value={verDesc}
									onChange={(e) => setVerDesc(e.target.value)}
									placeholder="Describe tags or changes included in this release..."
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
								disabled={publishing}
								onClick={handlePublish}
								className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
							>
								{publishing ? "Publishing..." : "Publish"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
