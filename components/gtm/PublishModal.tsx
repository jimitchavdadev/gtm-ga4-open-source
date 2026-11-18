"use client";

import { useState } from "react";

interface PublishModalProps {
	isOpen: boolean;
	onClose: () => void;
	onPublish: (name: string, desc: string) => Promise<void>;
}

export function PublishModal({
	isOpen,
	onClose,
	onPublish,
}: PublishModalProps) {
	const [name, setName] = useState("Live Production Snapshot");
	const [desc, setDesc] = useState("");
	const [publishing, setPublishing] = useState(false);

	if (!isOpen) return null;

	const handlePublish = async () => {
		setPublishing(true);
		try {
			await onPublish(name, desc);
			onClose();
		} finally {
			setPublishing(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
			<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
				<h3 className="text-lg font-bold text-gray-900">
					Publish Container Version
				</h3>
				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="ver-name"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Version Name
						</label>
						<input
							id="ver-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
						/>
					</div>
					<div>
						<label
							htmlFor="ver-desc"
							className="block text-xs font-semibold uppercase text-gray-600"
						>
							Version Description
						</label>
						<textarea
							id="ver-desc"
							rows={3}
							value={desc}
							onChange={(e) => setDesc(e.target.value)}
							placeholder="Describe tags or changes included in this release..."
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
						disabled={publishing}
						onClick={handlePublish}
						className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{publishing ? "Publishing..." : "Publish"}
					</button>
				</div>
			</div>
		</div>
	);
}
