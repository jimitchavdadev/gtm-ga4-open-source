import { store } from "../state";

export function renderGa4Overview(): HTMLElement {
	const el = document.createElement("div");
	const state = store.getState();
	const kpis = state.standardReports?.kpis || {
		totalUsers: 1,
		newUsers: 1,
		sessions: 1,
		eventCount: 3,
		totalRevenue: 129.5,
		engagementRate: 0.75,
		avgEngagementTimeSec: 84,
	};

	const eventCounts = state.standardReports?.eventCounts || {
		page_view: 5,
		session_start: 3,
		view_item: 2,
		purchase: 1,
	};

	const maxEventCount = Math.max(1, ...Object.values(eventCounts).map(Number));

	el.innerHTML = `
    <!-- Top KPI Grid -->
    <div class="grid-kpis">
      <div class="kpi-card" style="border-left-color: #1a73e8;">
        <div class="kpi-label">Users</div>
        <div class="kpi-value">${kpis.totalUsers}</div>
        <div style="font-size:12px; color:var(--success);">+100% vs last period</div>
      </div>
      <div class="kpi-card" style="border-left-color: #1e8e3e;">
        <div class="kpi-label">New Users</div>
        <div class="kpi-value">${kpis.newUsers}</div>
        <div style="font-size:12px; color:var(--text-muted);">First time visitors</div>
      </div>
      <div class="kpi-card" style="border-left-color: #f9ab00;">
        <div class="kpi-label">Sessions</div>
        <div class="kpi-value">${kpis.sessions}</div>
        <div style="font-size:12px; color:var(--text-muted);">${(kpis.engagementRate * 100).toFixed(0)}% engagement rate</div>
      </div>
      <div class="kpi-card" style="border-left-color: #129eaf;">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value">$${kpis.totalRevenue.toFixed(2)}</div>
        <div style="font-size:12px; color:var(--success);">Ecommerce purchases</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
      <!-- Event Breakdown Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Events by Event Name</h3>
          <span style="font-size:12px; color:var(--text-muted);">Last 30 minutes</span>
        </div>
        <div>
          ${Object.entries(eventCounts)
						.map(([name, count]) => {
							const pct = ((Number(count) / maxEventCount) * 100).toFixed(0);
							return `
                <div class="bar-chart-row">
                  <div class="bar-chart-label" title="${name}"><strong>${name}</strong></div>
                  <div class="bar-chart-track">
                    <div class="bar-chart-fill" style="width: ${pct}%;"></div>
                  </div>
                  <div style="width: 40px; text-align:right; font-weight:600;">${count}</div>
                </div>
              `;
						})
						.join("")}
        </div>
      </div>

      <!-- Realtime Mini Widget -->
      <div class="card" style="background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);">
        <div class="card-header">
          <div style="display:flex; align-items:center;">
            <span class="pulse-circle"></span>
            <h3 class="card-title" style="font-size:16px;">Realtime Snapshot</h3>
          </div>
          <span class="badge badge-green">Live</span>
        </div>
        <div style="text-align:center; padding: 20px 0;">
          <div style="font-size: 42px; font-weight: 700; color: var(--primary);">
            ${state.realtimeData?.activeUsersLast30Min || 1}
          </div>
          <div style="color:var(--text-muted); font-size:13px; font-weight:500;">Users active in last 30 minutes</div>
        </div>
        <div style="border-top:1px solid var(--border); padding-top:12px; font-size:12px; color:var(--text-muted); display:flex; justify-content:space-between;">
          <span>Total events ingested</span>
          <strong>${state.realtimeData?.eventCount || kpis.eventCount}</strong>
        </div>
      </div>
    </div>
  `;

	return el;
}
