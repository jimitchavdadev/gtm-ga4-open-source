"use client";

import { useState } from "react";
import { AdminTab } from "@/components/ga4/AdminTab";
import { AttributionTab } from "@/components/ga4/AttributionTab";
import { AudiencesTab } from "@/components/ga4/AudiencesTab";
import { FunnelTab } from "@/components/ga4/FunnelTab";
import { OverviewTab as Ga4Overview } from "@/components/ga4/OverviewTab";
import { RealtimeTab } from "@/components/ga4/RealtimeTab";
import { ReportsTab } from "@/components/ga4/ReportsTab";
import { EnterpriseTab } from "@/components/gtm/EnterpriseTab";
import { OverviewTab as GtmOverview } from "@/components/gtm/OverviewTab";
import { PreviewTab } from "@/components/gtm/PreviewTab";
import { TagsTab } from "@/components/gtm/TagsTab";
import { TriggersTab } from "@/components/gtm/TriggersTab";
import { VariablesTab } from "@/components/gtm/VariablesTab";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

export default function DashboardPage() {
	const [platform, setPlatform] = useState<"GTM" | "GA4">("GTM");
	const [activeTab, setActiveTab] = useState("OVERVIEW");
	const [containerId] = useState("GTM-OPENSOURCE");
	const [propertyId] = useState("prop_1");
	const [workspaceId] = useState("ws_default");
	const [previewActive, setPreviewActive] = useState(false);
	const [toast, setToast] = useState<string | null>(null);

	const showToast = (msg: string) => {
		setToast(msg);
		setTimeout(() => setToast(null), 3500);
	};

	const data = useAnalyticsData({
		workspaceId,
		containerId,
		propertyId,
		onNotify: showToast,
	});

	return (
		<div className="flex min-h-screen flex-col bg-[#f8f9fa]">
			<Navbar
				platform={platform}
				onPlatformChange={(p) => {
					setPlatform(p);
					setActiveTab("OVERVIEW");
				}}
				containerId={containerId}
				propertyId={propertyId}
				previewActive={previewActive}
				onTogglePreview={() => {
					const next = !previewActive;
					setPreviewActive(next);
					setActiveTab(next ? "PREVIEW" : "OVERVIEW");
				}}
				onOpenPublish={() => setActiveTab("OVERVIEW")}
			/>

			<div className="flex flex-1">
				<Sidebar
					platform={platform}
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>
				<main className="flex-1 p-8">
					{platform === "GTM" && activeTab === "OVERVIEW" && (
						<GtmOverview
							tagsCount={data.tags.length}
							triggersCount={data.triggers.length}
							variablesCount={data.variables.length}
							versions={data.versions}
							onPublish={data.publishWorkspace}
						/>
					)}
					{platform === "GTM" && activeTab === "TAGS" && (
						<TagsTab
							tags={data.tags}
							onCreateTag={(n, d) => data.createEntity(n, "TAG", d)}
							onDeleteTag={data.deleteEntity}
						/>
					)}
					{platform === "GTM" && activeTab === "TRIGGERS" && (
						<TriggersTab
							triggers={data.triggers}
							onCreateTrigger={(n, d) => data.createEntity(n, "TRIGGER", d)}
							onDeleteTrigger={data.deleteEntity}
						/>
					)}
					{platform === "GTM" && activeTab === "VARIABLES" && (
						<VariablesTab
							variables={data.variables}
							onCreateVariable={(n, d) => data.createEntity(n, "VARIABLE", d)}
							onDeleteVariable={data.deleteEntity}
						/>
					)}
					{platform === "GTM" && activeTab === "PREVIEW" && (
						<PreviewTab
							containerId={containerId}
							onPushEvent={(ev) =>
								showToast(`dataLayer.push(${JSON.stringify(ev)})`)
							}
						/>
					)}
					{platform === "GTM" && activeTab === "ENTERPRISE" && (
						<EnterpriseTab containerId={containerId} />
					)}

					{platform === "GA4" && activeTab === "OVERVIEW" && (
						<Ga4Overview
							standardReports={data.standardReports}
							realtimeData={data.realtimeData}
						/>
					)}
					{platform === "GA4" && activeTab === "REALTIME" && (
						<RealtimeTab
							realtimeData={data.realtimeData}
							containerId={containerId}
							onSendTestHit={data.sendTestHit}
						/>
					)}
					{platform === "GA4" && activeTab === "REPORTS" && <ReportsTab />}
					{platform === "GA4" && activeTab === "ATTRIBUTION" && (
						<AttributionTab attributionData={data.attributionData} />
					)}
					{platform === "GA4" && activeTab === "FUNNEL" && <FunnelTab />}
					{platform === "GA4" && activeTab === "AUDIENCES" && <AudiencesTab />}
					{platform === "GA4" && activeTab === "ADMIN" && <AdminTab />}
				</main>
			</div>

			{toast && (
				<div className="fixed bottom-6 right-6 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg animate-bounce">
					{toast}
				</div>
			)}
		</div>
	);
}
