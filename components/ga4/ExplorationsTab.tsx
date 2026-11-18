"use client";

import { useState } from "react";
import { CohortForm } from "./explorations/CohortForm";
import { FreeFormForm } from "./explorations/FreeFormForm";
import { PathExplorationForm } from "./explorations/PathExplorationForm";
import { SegmentOverlapForm } from "./explorations/SegmentOverlapForm";
import { UserExplorerForm } from "./explorations/UserExplorerForm";
import { UserLifetimeForm } from "./explorations/UserLifetimeForm";
import { FunnelTab } from "./FunnelTab";

type Technique =
	| "FREEFORM"
	| "FUNNEL"
	| "PATH"
	| "SEGMENT"
	| "COHORT"
	| "LIFETIME"
	| "USER_EXPLORER";

interface ExplorationsTabProps {
	runExploration?: (technique: string) => Promise<any>;
}

export function ExplorationsTab({
	runExploration: _runExploration,
}: ExplorationsTabProps = {}) {
	const [activeTechnique, setActiveTechnique] = useState<Technique>("FREEFORM");

	const techniques: { id: Technique; label: string; icon: string }[] = [
		{ id: "FREEFORM", label: "Free-form", icon: "📊" },
		{ id: "FUNNEL", label: "Funnel Exploration", icon: "📉" },
		{ id: "PATH", label: "Path Exploration", icon: "🌳" },
		{ id: "SEGMENT", label: "Segment Overlap", icon: "⭕" },
		{ id: "COHORT", label: "Cohort Exploration", icon: "👥" },
		{ id: "LIFETIME", label: "User Lifetime (LTV)", icon: "💰" },
		{ id: "USER_EXPLORER", label: "User Explorer", icon: "🔍" },
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">
						GA4 Explorations Suite
					</h2>
					<p className="mt-1 text-sm text-gray-500">
						Advanced deep-dive report forms for behavioral and conversion
						discovery
					</p>
				</div>
			</div>

			{/* Technique Pills */}
			<div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xs">
				{techniques.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => setActiveTechnique(t.id)}
						className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
							activeTechnique === t.id
								? "bg-blue-600 text-white shadow-xs"
								: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
						}`}
					>
						<span>{t.icon}</span>
						<span>{t.label}</span>
					</button>
				))}
			</div>

			{/* Active Technique Body */}
			{activeTechnique === "FREEFORM" && <FreeFormForm />}
			{activeTechnique === "FUNNEL" && <FunnelTab />}
			{activeTechnique === "PATH" && <PathExplorationForm />}
			{activeTechnique === "SEGMENT" && <SegmentOverlapForm />}
			{activeTechnique === "COHORT" && <CohortForm />}
			{activeTechnique === "LIFETIME" && <UserLifetimeForm />}
			{activeTechnique === "USER_EXPLORER" && <UserExplorerForm />}
		</div>
	);
}
