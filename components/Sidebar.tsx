"use client";

interface SidebarProps {
	platform: "GTM" | "GA4";
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export function Sidebar({ platform, activeTab, onTabChange }: SidebarProps) {
	const gtmItems = [
		{ id: "OVERVIEW", label: "Overview", icon: "📊" },
		{ id: "TAGS", label: "Tags", icon: "🏷️" },
		{ id: "TRIGGERS", label: "Triggers", icon: "⚡" },
		{ id: "VARIABLES", label: "Variables", icon: "🧩" },
		{ id: "PREVIEW", label: "Tag Assistant", icon: "🔍" },
		{ id: "ENTERPRISE", label: "360 Governance", icon: "🏢" },
	];

	const ga4Items = [
		{ id: "OVERVIEW", label: "Home Dashboard", icon: "🏠" },
		{ id: "REALTIME", label: "Realtime", icon: "🔴" },
		{ id: "REPORTS", label: "Reports", icon: "📈" },
		{ id: "ATTRIBUTION", label: "Attribution (DDA)", icon: "🎯" },
		{ id: "FUNNEL", label: "Funnel Explore", icon: "📉" },
		{ id: "AUDIENCES", label: "Audiences & ML", icon: "👥" },
		{ id: "ADMIN", label: "Admin & Settings", icon: "⚙️" },
	];

	const items = platform === "GTM" ? gtmItems : ga4Items;

	return (
		<aside className="w-60 shrink-0 border-r border-gray-200 bg-white py-4 shadow-xs">
			<div className="px-5 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
				{platform === "GTM" ? "Tag Manager Workspace" : "GA4 Property Reports"}
			</div>
			<nav className="flex flex-col gap-1">
				{items.map((item) => {
					const isActive = activeTab === item.id;
					return (
						<button
							key={item.id}
							type="button"
							onClick={() => onTabChange(item.id)}
							className={`flex items-center gap-3 rounded-r-full px-5 py-2.5 text-left text-sm font-medium transition ${
								isActive
									? "bg-blue-50 text-blue-700"
									: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
							}`}
						>
							<span className="text-base">{item.icon}</span>
							<span>{item.label}</span>
						</button>
					);
				})}
			</nav>
		</aside>
	);
}
