"use client";

import { useState } from "react";

interface VariableCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (name: string, type: string, path: string) => Promise<void>;
}

export function VariableCreateModal({
	isOpen,
	onClose,
	onSave,
}: VariableCreateModalProps) {
	const [name, setName] = useState("");
	const [type, setType] = useState("DATA_LAYER");
	const [path, setPath] = useState("");
	const [saving, setSaving] = useState(false);

	if (!isOpen) return null;

	const handleSave = async () => {
		if (!name.trim()) return;
		setSaving(true);
		await onSave(name, type, path);
		setSaving(false);
		setName("");
		setPath("");
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
			<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
				<h3 className="text-lg font-bold text-gray-900">
					Create User-Defined Variable
				</h3>
				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="var-name"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Variable Name
						</label>
						<input
							id="var-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
						/>
					</div>
					<div>
						<label
							htmlFor="var-type"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Variable Type
						</label>
						<select
							id="var-type"
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
						<label
							htmlFor="var-path"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Path / Key / Value
						</label>
						<input
							id="var-path"
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
						onClick={onClose}
						className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="button"
						disabled={saving}
						onClick={handleSave}
						className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{saving ? "Saving..." : "Save Variable"}
					</button>
				</div>
			</div>
		</div>
	);
}
