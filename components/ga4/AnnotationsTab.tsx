"use client";

import { AnnotationCreateForm } from "./AnnotationCreateForm";

export interface AnnotationItem {
	id: string;
	title: string;
	description: string;
	date: string;
	color: string;
}

interface AnnotationsTabProps {
	annotations?: AnnotationItem[];
	onCreateAnnotation?: (
		title: string,
		description: string,
		date: string,
		color: string,
	) => void;
	onDeleteAnnotation?: (id: string) => void;
}

export function AnnotationsTab({
	annotations = [],
	onCreateAnnotation,
	onDeleteAnnotation,
}: AnnotationsTabProps) {
	const handleAdd = (item: AnnotationItem) => {
		if (onCreateAnnotation) {
			onCreateAnnotation(item.title, item.description, item.date, item.color);
		}
	};

	const handleDelete = (id: string) => {
		if (onDeleteAnnotation) {
			onDeleteAnnotation(id);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">
					GA4 Property Annotations
				</h1>
				<p className="mt-1 text-sm text-gray-500">
					Record website releases, marketing campaigns, and incidents directly
					on reporting timelines (up to 1,000 per property).
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<AnnotationCreateForm onAdd={handleAdd} />

				<div className="space-y-3 lg:col-span-2">
					<h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
						Property Timeline Annotations ({annotations.length})
					</h3>
					<div className="space-y-3">
						{annotations.length === 0 ? (
							<div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
								No annotations yet. Record your first event above.
							</div>
						) : (
							annotations.map((ann) => (
								<div
									key={ann.id}
									className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-xs"
								>
									<div className="flex items-start gap-3">
										<div
											className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
											style={{ backgroundColor: ann.color }}
										/>
										<div>
											<div className="flex items-center gap-2">
												<h4 className="font-semibold text-gray-900 text-sm">
													{ann.title}
												</h4>
												<span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600">
													{ann.date}
												</span>
											</div>
											<p className="mt-1 text-xs text-gray-600">
												{ann.description}
											</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() => handleDelete(ann.id)}
										className="text-xs text-red-500 hover:text-red-700"
									>
										Delete
									</button>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
