"use client";

import { useState } from "react";

interface TriggerCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (name: string, type: string, condition: string) => Promise<void>;
}

export function TriggerCreateModal({
	isOpen,
	onClose,
	onSave,
}: TriggerCreateModalProps) {
	const [name, setName] = useState("");
	const [type, setType] = useState("CUSTOM_EVENT");
	const [condition, setCondition] = useState("");
	const [saving, setSaving] = useState(false);

	if (!isOpen) return null;

	const handleSave = async () => {
		if (!name.trim()) return;
		setSaving(true);
		await onSave(name, type, condition);
		setSaving(false);
		setName("");
		setCondition("");
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
			<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
				<h3 className="text-lg font-bold text-gray-900">Create New Trigger</h3>
				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="trigger-name"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Trigger Name
						</label>
						<input
							id="trigger-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
						/>
					</div>
					<div>
						<label
							htmlFor="trigger-type"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Trigger Type
						</label>
						<select
							id="trigger-type"
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
						<label
							htmlFor="trigger-cond"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Condition Filter
						</label>
						<input
							id="trigger-cond"
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
						{saving ? "Saving..." : "Save Trigger"}
					</button>
				</div>
			</div>
		</div>
	);
}
