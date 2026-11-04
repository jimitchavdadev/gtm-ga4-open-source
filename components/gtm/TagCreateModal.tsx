"use client";

import { useState } from "react";

interface TagCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (
		name: string,
		type: string,
		triggerName: string,
		priority: number,
		requiredConsent: string,
	) => Promise<void>;
}

export function TagCreateModal({
	isOpen,
	onClose,
	onSave,
}: TagCreateModalProps) {
	const [name, setName] = useState("");
	const [type, setType] = useState("GA4_EVENT");
	const [triggerName, setTriggerName] = useState("All Pages");
	const [priority, setPriority] = useState(0);
	const [requiredConsent, setRequiredConsent] = useState("analytics_storage");
	const [saving, setSaving] = useState(false);

	if (!isOpen) return null;

	const handleSave = async () => {
		if (!name.trim()) return;
		setSaving(true);
		await onSave(name, type, triggerName, priority, requiredConsent);
		setSaving(false);
		setName("");
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
			<div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
				<h3 className="text-lg font-bold text-gray-900">Create New Tag</h3>
				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="tag-name"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Tag Name
						</label>
						<input
							id="tag-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
						/>
					</div>
					<div>
						<label
							htmlFor="tag-type"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Tag Type
						</label>
						<select
							id="tag-type"
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
						<label
							htmlFor="tag-trigger"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Firing Trigger
						</label>
						<select
							id="tag-trigger"
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
							<label
								htmlFor="tag-priority"
								className="block text-xs font-semibold uppercase text-gray-600"
							>
								Priority
							</label>
							<input
								id="tag-priority"
								type="number"
								value={priority}
								onChange={(e) => setPriority(Number(e.target.value))}
								className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
							/>
						</div>
						<div>
							<label
								htmlFor="tag-consent"
								className="block text-xs font-semibold uppercase text-gray-600"
							>
								Consent
							</label>
							<select
								id="tag-consent"
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
						{saving ? "Saving..." : "Save Tag"}
					</button>
				</div>
			</div>
		</div>
	);
}
