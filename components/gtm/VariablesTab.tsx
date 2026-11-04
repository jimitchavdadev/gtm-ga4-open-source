"use client";

import { useState } from "react";
import { VariableCreateModal } from "./VariableCreateModal";

interface VariablesTabProps {
	variables: any[];
	onCreateVariable: (name: string, type: string, data: any) => Promise<void>;
	onDeleteVariable: (id: string) => Promise<void>;
}

export function VariablesTab({
	variables,
	onCreateVariable,
	onDeleteVariable,
}: VariablesTabProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSave = async (name: string, type: string, path: string) => {
		await onCreateVariable(name, type, { path: path || name });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">Variables</h2>
					<p className="mt-1 text-sm text-gray-500">
						Named placeholders whose values are populated at runtime
					</p>
				</div>
				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700"
				>
					+ New Variable
				</button>
			</div>

			{/* Built-in Variables */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">
					Built-in Variables
				</h3>
				<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
					{[
						"Page URL",
						"Page Hostname",
						"Page Path",
						"Referrer",
						"Event",
						"Click Element",
						"Click Classes",
						"Click ID",
					].map((v) => (
						<div
							key={v}
							className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2.5 text-xs"
						>
							<span className="font-medium text-gray-700">{v}</span>
							<span className="text-xs font-semibold text-emerald-600">
								Active
							</span>
						</div>
					))}
				</div>
			</div>

			{/* User-Defined Variables */}
			<div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
				<div className="border-b border-gray-200 bg-white px-6 py-4">
					<h3 className="text-base font-bold text-gray-900">
						User-Defined Variables
					</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-6 py-3">Variable Name</th>
								<th className="px-6 py-3">Type</th>
								<th className="px-6 py-3">Value / Reference</th>
								<th className="px-6 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{variables.length === 0 ? (
								<tr>
									<td colSpan={4} className="py-6 text-center text-gray-400">
										No user-defined variables yet. Click "+ New Variable" to add
										one.
									</td>
								</tr>
							) : (
								variables.map((v) => {
									let dataObj: any = {};
									try {
										dataObj = JSON.parse(v.data_json || "{}");
									} catch {}
									return (
										<tr key={v.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 font-semibold text-gray-900">
												{v.name}
											</td>
											<td className="px-6 py-4">
												<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
													{v.type}
												</span>
											</td>
											<td className="px-6 py-4 font-mono text-xs text-gray-500">
												{dataObj.path || JSON.stringify(dataObj)}
											</td>
											<td className="px-6 py-4 text-right">
												<button
													type="button"
													onClick={() => onDeleteVariable(v.id)}
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

			<VariableCreateModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSave}
			/>
		</div>
	);
}
