import { ApiClient } from "../api";
import { store } from "../state";

export function renderGa4Realtime(): HTMLElement {
	const el = document.createElement("div");
	const state = store.getState();
	const events = state.realtimeData?.events || [];
	const activeUsers = state.realtimeData?.activeUsersLast30Min || 1;

	el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
      <div>
        <div style="display:flex; align-items:center;">
          <span class="pulse-circle"></span>
          <h2 style="font-size: 20px; font-weight: 500;">Realtime Overview</h2>
        </div>
        <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Activity on your site or app in the last 30 minutes</p>
      </div>
      <button id="btn-fire-test-hit" class="btn-primary">+ Send Test Wire Hit (/g/collect)</button>
    </div>

    <div style="display:grid; grid-template-columns: 320px 1fr; gap:20px; margin-bottom:20px;">
      <div class="card" style="text-align:center; padding: 30px 20px;">
        <div style="font-size: 56px; font-weight: 700; color: var(--primary); line-height: 1.1;">
          ${activeUsers}
        </div>
        <div style="font-size: 14px; font-weight: 500; margin-top: 6px;">Users in last 30 minutes</div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted);">
          Device: <strong>100% Desktop (Chrome)</strong>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Top Countries (Realtime)</h3>
        </div>
        <div>
          <div class="bar-chart-row">
            <div class="bar-chart-label">United States</div>
            <div class="bar-chart-track"><div class="bar-chart-fill" style="width: 70%;"></div></div>
            <div style="width: 30px; text-align:right; font-weight:600;">70%</div>
          </div>
          <div class="bar-chart-row">
            <div class="bar-chart-label">Germany</div>
            <div class="bar-chart-track"><div class="bar-chart-fill" style="width: 20%;"></div></div>
            <div style="width: 30px; text-align:right; font-weight:600;">20%</div>
          </div>
          <div class="bar-chart-row">
            <div class="bar-chart-label">United Kingdom</div>
            <div class="bar-chart-track"><div class="bar-chart-fill" style="width: 10%;"></div></div>
            <div style="width: 30px; text-align:right; font-weight:600;">10%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Event Stream Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recent Event Stream</h3>
        <span style="font-size:12px; color:var(--text-muted);">${events.length} events logged</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event Name</th>
            <th>Client ID</th>
            <th>Parameters</th>
            <th>Conversion</th>
          </tr>
        </thead>
        <tbody>
          ${
						events.length === 0
							? `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No events logged yet. Click "+ Send Test Wire Hit" above!</td></tr>`
							: events
									.slice(0, 8)
									.map((ev: any) => {
										const timeStr = new Date(
											Math.floor(ev.timestamp_micros / 1000),
										).toLocaleTimeString();
										return `
                <tr>
                  <td><code style="font-size:12px;">${timeStr}</code></td>
                  <td><strong>${ev.event_name}</strong></td>
                  <td><code>${ev.client_id}</code></td>
                  <td><code style="font-size:11px; max-width:300px; display:inline-block; overflow:hidden; text-overflow:ellipsis;">${ev.event_params_json}</code></td>
                  <td>${ev.is_conversion ? '<span class="badge badge-green">Key Event</span>' : '<span style="color:#aaa;">-</span>'}</td>
                </tr>
              `;
									})
									.join("")
					}
        </tbody>
      </table>
    </div>
  `;

	el.querySelector("#btn-fire-test-hit")?.addEventListener("click", async () => {
		store.notifyUser("Sending test /g/collect request...", "info");
		await fetch(
			`/g/collect?v=2&tid=${state.containerId}&cid=user_${Date.now()}&en=purchase&ep.value=79.99&ep.currency=USD`,
			{ method: "POST" },
		);
		const refreshed = await ApiClient.fetchRealtime(state.propertyId);
		store.setState({ realtimeData: refreshed });
		store.notifyUser("Purchase conversion received live in Realtime!", "success");
	});

	return el;
}
