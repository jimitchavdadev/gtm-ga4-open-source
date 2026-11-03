export function renderGa4Funnel(): HTMLElement {
	const el = document.createElement("div");

	const funnelSteps = [
		{ name: "1. View Item (Product Page)", users: 1000, pct: 100, dropPct: 0 },
		{ name: "2. Add to Cart", users: 450, pct: 45.0, dropPct: 55.0 },
		{ name: "3. Begin Checkout", users: 220, pct: 22.0, dropPct: 51.1 },
		{ name: "4. Purchase (Key Event)", users: 140, pct: 14.0, dropPct: 36.4 },
	];

	el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
      <div>
        <h2 style="font-size: 20px; font-weight: 500;">Explore: Funnel Exploration</h2>
        <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Multi-step user journey drop-off and completion analysis</p>
      </div>
      <div style="font-size:13px; color:var(--text-muted);">
        Overall Funnel Conversion Rate: <strong style="color:var(--success); font-size:15px;">14.0%</strong>
      </div>
    </div>

    <!-- Visual Funnel Bars -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Ecommerce Checkout Journey</h3>
      </div>
      <div style="display:flex; flex-direction:column; gap:20px; margin: 10px 0;">
        ${funnelSteps
					.map(
						(s) => `
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
              <strong>${s.name}</strong>
              <span><strong>${s.users.toLocaleString()}</strong> users (${s.pct.toFixed(1)}%)</span>
            </div>
            <div style="height:26px; background:#f1f3f4; border-radius:4px; overflow:hidden; position:relative;">
              <div style="height:100%; width:${s.pct}%; background:linear-gradient(90deg, #1a73e8, #4285f4); border-radius:4px;"></div>
            </div>
            ${
							s.dropPct > 0
								? `<div style="font-size:11px; color:var(--danger); margin-top:4px;">&darr; Drop-off: ${s.dropPct.toFixed(1)}% (${(s.users / (s.pct / 100) - s.users).toFixed(0)} users abandoned)</div>`
								: ""
						}
          </div>
        `,
					)
					.join("")}
      </div>
    </div>

    <!-- Funnel Data Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Step-by-Step Drop-off Metrics</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Funnel Step</th>
            <th>Active Users</th>
            <th>Completion Rate</th>
            <th>Drop-offs</th>
            <th>Abandonment Rate</th>
          </tr>
        </thead>
        <tbody>
          ${funnelSteps
						.map(
							(s) => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td>${s.users.toLocaleString()}</td>
              <td><span class="badge badge-green">${s.pct.toFixed(1)}%</span></td>
              <td>${s.dropPct > 0 ? (s.users * (s.dropPct / 100)).toFixed(0) : "0"}</td>
              <td>${s.dropPct > 0 ? `<span class="badge badge-red">${s.dropPct.toFixed(1)}%</span>` : "-"}</td>
            </tr>
          `,
						)
						.join("")}
        </tbody>
      </table>
    </div>
  `;

	return el;
}
