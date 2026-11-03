"use client";

import { useState } from "react";

interface VariablesTabProps {
	variables: any[];
	onCreateVariable: (name: string, data: any) => Promise<void>;
	onDeleteVariable: (id: string) => Promise<void>;
}

export function VariablesTab({
	variables,
	onCreateVariable,
	onDeleteVariable,
}: VariablesTabProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [name, setName] = useState("dlv - value");
	const [type, setType] = useState("DATA_LAYER");
	const [path, setPath] = useState("ecommerce.value");

	const handleSave = async () => {
		await onCreateVariable(name, { type, path });
		setIsModalOpen(false);
	};

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">Built-in Variables</h3>
				<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 text-sm text-gray-700">
					{["Page URL", "Page Path", "Event", "Click Element", "Click Classes", "Click ID"].map((item) => (
						<label key={item} className="flex items-center gap-2">
							<input type="checkbox" defaultChecked disabled className="rounded text-blue-600" />
							<span>{item}</span>
						</label>
					))}
				</div>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold text-gray-900">User-Defined Variables</h2>
						<p className="mt-1 text-sm text-gray-500">
							Dynamic named placeholders whose values are populated at runtime
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

				<div className="mt-6 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Variable Name</th>
								<th className="px-4 py-3">Type</th>
								<th className="px-4 py-3">Data Layer / Path</th>
								<th className="px-4 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{variables.length === 0 ? (
								<tr>
									<td colSpan={4} className="py-6 text-center text-gray-400">
										No user-defined variables yet. Click "+ New Variable" to add one.
									</td>
								</tr>
							) : (
								variables.map((v) => {
									const data = JSON.parse(v.data_json || "{}");
									return (
										<tr key={v.id} className="hover:bg-gray-50">
											<td className="px-4 py-3 font-semibold text-gray-900">
												<code>{`{{${v.name}}}`}</code>
											</td>
											<td className="px-4 py-3">
												<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
													{data.type || "DATA_LAYER"}
												</span>
											</td>
											<td className="px-4 py-3 font-mono text-xs text-gray-700">
												{data.path || "-"}
											</td>
											<td className="px-4 py-3 text-right">
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

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
						<h3 className="text-lg font-bold text-gray-900">Create User-Defined Variable</h3>
						<div className="mt-4 space-y-4">
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Variable Name</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Variable Type</label>
								<select
									value={type}
									onChange={(e) => setType(e.target.value)}
									className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
								>
									<option value="DATA_LAYER">Data Layer Variable</option>
									<option value="1ST_PARTY_COOKIE">1st Party Cookie</option>
									<option value="URL">URL Variable</option>
									<option value="CUSTOM_JS">Custom JavaScript</option>
									<option value="CONSTANT">Constant</option>
								</select>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase text-gray-600">Path / Key / Value</label>
								<input
									type="text"
									value={path}
									onChange={(e) => setPath(e.target.value)}
									placeholder="e.g. ecommerce.value"
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
								Save Variable
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
