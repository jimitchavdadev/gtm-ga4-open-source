"use client";

interface OverviewTabProps {
	standardReports: any;
	realtimeData: any;
}

export function OverviewTab({ standardReports, realtimeData }: OverviewTabProps) {
	const kpis = standardReports?.kpis || {
		totalUsers: 1,
		newUsers: 1,
		sessions: 1,
		eventCount: 3,
		totalRevenue: 129.5,
		engagementRate: 0.75,
		avgEngagementTimeSec: 84,
	};

	const eventCounts = standardReports?.eventCounts || {
		page_view: 5,
		session_start: 3,
		view_item: 2,
		purchase: 1,
	};

	const maxEventCount = Math.max(1, ...Object.values(eventCounts).map(Number));

	return (
		<div className="space-y-6">
			{/* Top KPI Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border border-gray-200 border-l-4 border-l-blue-600 bg-white p-5 shadow-xs">
					<div className="text-xs font-semibold uppercase text-gray-500">Users</div>
					<div className="mt-2 text-3xl font-bold text-gray-900">{kpis.totalUsers}</div>
					<div className="mt-1 text-xs font-medium text-emerald-600">+100% vs last period</div>
				</div>

				<div className="rounded-xl border border-gray-200 border-l-4 border-l-emerald-600 bg-white p-5 shadow-xs">
					<div className="text-xs font-semibold uppercase text-gray-500">New Users</div>
					<div className="mt-2 text-3xl font-bold text-gray-900">{kpis.newUsers}</div>
					<div className="mt-1 text-xs text-gray-500">First time visitors</div>
				</div>

				<div className="rounded-xl border border-gray-200 border-l-4 border-l-amber-500 bg-white p-5 shadow-xs">
					<div className="text-xs font-semibold uppercase text-gray-500">Sessions</div>
					<div className="mt-2 text-3xl font-bold text-gray-900">{kpis.sessions}</div>
					<div className="mt-1 text-xs text-gray-500">
						{(kpis.engagementRate * 100).toFixed(0)}% engagement rate
					</div>
				</div>

				<div className="rounded-xl border border-gray-200 border-l-4 border-l-cyan-600 bg-white p-5 shadow-xs">
					<div className="text-xs font-semibold uppercase text-gray-500">Total Revenue</div>
					<div className="mt-2 text-3xl font-bold text-gray-900">${kpis.totalRevenue.toFixed(2)}</div>
					<div className="mt-1 text-xs font-medium text-emerald-600">Ecommerce purchases</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Events Chart */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-2">
					<div className="flex items-center justify-between border-b border-gray-100 pb-4">
						<h3 className="text-base font-bold text-gray-900">Events by Event Name</h3>
						<span className="text-xs text-gray-500">Last 30 minutes</span>
					</div>
					<div className="mt-4 space-y-3">
						{Object.entries(eventCounts).map(([name, count]) => {
							const pct = ((Number(count) / maxEventCount) * 100).toFixed(0);
							return (
								<div key={name} className="flex items-center gap-3">
									<div className="w-36 truncate text-xs font-semibold text-gray-700" title={name}>
										{name}
									</div>
									<div className="h-5 flex-1 overflow-hidden rounded-md bg-gray-100">
										<div
											className="h-full rounded-md bg-blue-600 transition-all duration-300"
											style={{ width: `${pct}%` }}
										/>
									</div>
									<div className="w-10 text-right text-xs font-bold text-gray-900">{String(count)}</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Realtime Snapshot */}
				<div className="rounded-xl border border-gray-200 bg-linear-to-b from-white to-blue-50/30 p-6 shadow-xs">
					<div className="flex items-center justify-between border-b border-gray-100 pb-4">
						<div className="flex items-center gap-2">
							<span className="pulse-circle" />
							<h3 className="text-base font-bold text-gray-900">Realtime Snapshot</h3>
						</div>
						<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
							Live
						</span>
					</div>

					<div className="py-8 text-center">
						<div className="text-5xl font-extrabold text-blue-600">
							{realtimeData?.activeUsersLast30Min || 1}
						</div>
						<div className="mt-2 text-xs font-medium text-gray-500">
							Users active in last 30 minutes
						</div>
					</div>

					<div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
						<span>Total events ingested</span>
						<strong className="text-gray-900">{realtimeData?.eventCount || kpis.eventCount}</strong>
					</div>
				</div>
			</div>
		</div>
	);
}
