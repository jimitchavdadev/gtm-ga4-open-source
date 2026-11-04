"use client";

import { useState } from "react";
import { AcquisitionSection } from "./reports/AcquisitionSection";
import { EngagementSection } from "./reports/EngagementSection";
import { MonetizationSection } from "./reports/MonetizationSection";
import { TechSection } from "./reports/TechSection";

type SubTab = "ACQUISITION" | "ENGAGEMENT" | "MONETIZATION" | "TECH";

export function ReportsTab() {
	const [activeSubTab, setActiveSubTab] = useState<SubTab>("ACQUISITION");

	const tabs: { id: SubTab; label: string }[] = [
		{ id: "ACQUISITION", label: "Traffic Acquisition" },
		{ id: "ENGAGEMENT", label: "Engagement" },
		{ id: "MONETIZATION", label: "Monetization" },
		{ id: "TECH", label: "Tech & Devices" },
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">
						Life Cycle & User Reports
					</h2>
					<p className="mt-1 text-sm text-gray-500">
						Explore how users discover and interact with your site or
						application
					</p>
				</div>
				<div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveSubTab(tab.id)}
							className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
								activeSubTab === tab.id
									? "bg-white text-blue-600 shadow-xs"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{activeSubTab === "ACQUISITION" && <AcquisitionSection />}
			{activeSubTab === "ENGAGEMENT" && <EngagementSection />}
			{activeSubTab === "MONETIZATION" && <MonetizationSection />}
			{activeSubTab === "TECH" && <TechSection />}
		</div>
	);
}
