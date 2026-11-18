"use client";

import { useState } from "react";
import type { AnnotationItem } from "./AnnotationsTab";

interface AnnotationCreateFormProps {
	onAdd: (item: AnnotationItem) => void;
}

export function AnnotationCreateForm({ onAdd }: AnnotationCreateFormProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState("2026-11-18");
	const [color, setColor] = useState("#1a73e8");
	const [error, setError] = useState<string | null>(null);

	const handleAdd = () => {
		if (!title.trim()) {
			setError("Title is required");
			return;
		}
		if (title.length > 60) {
			setError("Title cannot exceed 60 characters");
			return;
		}
		if (description.length > 150) {
			setError("Description cannot exceed 150 characters");
			return;
		}
		onAdd({
			id: `ann_${Date.now()}`,
			title,
			description,
			date,
			color,
		});
		setTitle("");
		setDescription("");
		setError(null);
	};

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
			<h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
				Create New Annotation
			</h3>
			{error && (
				<div className="mb-3 rounded-md bg-red-50 p-2 text-xs text-red-600">
					{error}
				</div>
			)}
			<div className="space-y-3">
				<div>
					<label
						htmlFor="annotation-title"
						className="block text-xs font-semibold text-gray-600"
					>
						Title (max 60 chars)
					</label>
					<input
						id="annotation-title"
						type="text"
						maxLength={60}
						placeholder="e.g. Summer Promo Launch"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
					/>
				</div>
				<div>
					<label
						htmlFor="annotation-desc"
						className="block text-xs font-semibold text-gray-600"
					>
						Description (max 150 chars)
					</label>
					<textarea
						id="annotation-desc"
						rows={2}
						maxLength={150}
						placeholder="Context or impact description..."
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label
							htmlFor="annotation-date"
							className="block text-xs font-semibold text-gray-600"
						>
							Date
						</label>
						<input
							id="annotation-date"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
						/>
					</div>
					<div>
						<label
							htmlFor="annotation-color"
							className="block text-xs font-semibold text-gray-600"
						>
							Color
						</label>
						<select
							id="annotation-color"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
						>
							<option value="#1a73e8">Blue (Release)</option>
							<option value="#188038">Green (Campaign)</option>
							<option value="#e37400">Orange (Warning)</option>
							<option value="#d93025">Red (Incident)</option>
						</select>
					</div>
				</div>
				<button
					type="button"
					onClick={handleAdd}
					className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					+ Add Annotation
				</button>
			</div>
		</div>
	);
}
