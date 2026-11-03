import { store } from "../state";

export function renderGa4Admin(): HTMLElement {
	const el = document.createElement("div");

	el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
      <div>
        <h2 style="font-size: 20px; font-weight: 500;">Property Settings & Administration</h2>
        <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Manage data streams, custom dimensions, data privacy, and 360 hierarchy</p>
      </div>
    </div>

    <!-- Data Streams Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Data Streams</h3>
        <button id="btn-add-stream" class="btn-primary">+ Add Stream</button>
      </div>
      <div style="border:1px solid var(--border); border-radius:6px; padding:16px; background:#fafafa;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:15px; font-weight:600;">🌐 Web Data Stream - Production Store</div>
            <div style="font-size:13px; color:var(--text-muted); margin-top:2px;">URL: <code>https://example.com</code></div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px; color:var(--text-muted);">MEASUREMENT ID</div>
            <div style="font-size:16px; font-weight:700; color:var(--primary);">G-TESTSTREAM</div>
          </div>
        </div>

        <div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--border); display:flex; gap:20px; font-size:12px;">
          <div>Enhanced Measurement: <strong style="color:var(--success);">Enabled (All 6 events)</strong></div>
          <div>Measurement Protocol API Secret: <code>secret_123</code></div>
        </div>
      </div>
    </div>

    <!-- Custom Definitions Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Custom Dimensions & Metrics (Free & 360 Limits)</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Definition Name</th>
            <th>Scope</th>
            <th>Event Parameter</th>
            <th>Quota Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Customer Tier</strong></td>
            <td><span class="badge badge-blue">User Scoped</span></td>
            <td><code>customer_tier</code></td>
            <td>1 / 100 used (360)</td>
          </tr>
          <tr>
            <td><strong>Blog Author</strong></td>
            <td><span class="badge badge-yellow">Event Scoped</span></td>
            <td><code>author_name</code></td>
            <td>1 / 125 used (360)</td>
          </tr>
          <tr>
            <td><strong>Average Order Value (AOV)</strong></td>
            <td><span class="badge badge-green">Calculated Metric</span></td>
            <td><code>{value} / {purchases}</code></td>
            <td>1 / 50 used (360)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Data Redaction & Privacy -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Data Privacy & Email Redaction</h3>
      </div>
      <div style="display:flex; flex-direction:column; gap:16px;">
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
          <input type="checkbox" id="check-redact-email" checked style="width:16px; height:16px;">
          <div>
            <strong>Client-Side & Server-Side Email Address Redaction</strong>
            <div style="font-size:12px; color:var(--text-muted);">Automatically scans URLs and text parameters for email patterns and replaces with <code>(redacted)</code>.</div>
          </div>
        </label>
        <div>
          <label style="display:block; margin-bottom:6px; font-weight:500; font-size:13px;">Stripped URL Query Parameters (Sensitive Data)</label>
          <input type="text" value="token, auth, password, ssn, session_secret" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:4px; font-size:13px;">
        </div>
      </div>
    </div>

    <!-- 360 Subproperties & Rollups -->
    <div class="card">
      <div class="card-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <h3 class="card-title">360 Subproperties & Roll-up Properties</h3>
          <span class="badge badge-blue">360 Tier</span>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Property Name</th>
            <th>Type</th>
            <th>Filter / Source Rule</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>US Region Subproperty</strong></td>
            <td><span class="badge badge-blue">Subproperty</span></td>
            <td><code>country == 'US'</code></td>
            <td><span class="badge badge-green">Routing Hits</span></td>
          </tr>
          <tr>
            <td><strong>Global Enterprise Roll-up</strong></td>
            <td><span class="badge badge-green">Roll-up Property</span></td>
            <td>Aggregates <code>Web Store</code> + <code>EU Regional</code></td>
            <td><span class="badge badge-green">Aggregating</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

	el.querySelector("#check-redact-email")?.addEventListener("change", (e) => {
		const checked = (e.target as HTMLInputElement).checked;
		store.notifyUser(
			`Email redaction ${checked ? "enabled" : "disabled"}`,
			"info",
		);
	});

	el.querySelector("#btn-add-stream")?.addEventListener("click", () => {
		store.notifyUser("Opening Data Stream Setup Modal...", "info");
	});

	return el;
}
