import { store } from "../state";

export function renderGtmEnterprise(): HTMLElement {
	const el = document.createElement("div");

	el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
      <div>
        <div style="display:flex; align-items:center; gap:8px;">
          <h2 style="font-size:20px; font-weight:500;">GTM 360 Enterprise Governance</h2>
          <span class="badge badge-blue">360 Tier</span>
        </div>
        <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Manage multi-container Zones, Approval Workflows, and Environments</p>
      </div>
      <button id="btn-add-zone" class="btn-primary">+ Create Zone</button>
    </div>

    <!-- Container Zones Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Container Zones (360)</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Zone Name</th>
            <th>Child Container ID</th>
            <th>Boundaries</th>
            <th>Type Restrictions</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Marketing Agency Zone</strong></td>
            <td><code>GTM-MKTG999</code></td>
            <td>URL matches <code>/campaigns/*</code></td>
            <td><span class="badge badge-blue">Google Ads, Floodlight</span></td>
            <td><span class="badge badge-green">Active</span></td>
          </tr>
          <tr>
            <td><strong>Regional EU Zone</strong></td>
            <td><code>GTM-EU444</code></td>
            <td>Country equals <code>DE, FR, IT</code></td>
            <td><span class="badge badge-green">Consent Enforced</span></td>
            <td><span class="badge badge-green">Active</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Multi-Stage Approvals Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Approval Workflows (360)</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Workspace / Request</th>
            <th>Requested By</th>
            <th>Review Status</th>
            <th>Stage</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="approvals-tbody">
          <tr>
            <td>
              <strong>New Checkout Tags</strong><br>
              <span style="font-size:12px; color:var(--text-muted);">Added purchase conversion and Floodlight tags</span>
            </td>
            <td>dev-lead@company.com</td>
            <td><span class="badge badge-yellow">Pending Review</span></td>
            <td>Security & QA Review</td>
            <td style="text-align:right;">
              <button class="btn-secondary btn-approve" style="padding:4px 8px; font-size:12px;">Approve</button>
              <button class="btn-danger btn-reject" style="padding:4px 8px; font-size:12px;">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Environments Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Environments (Live, Staging, QA)</h3>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <div style="border:1px solid var(--border); border-radius:6px; padding:14px;">
          <div style="display:flex; justify-content:space-between;">
            <strong>Live / Production</strong>
            <span class="badge badge-green">Default</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin: 8px 0;">Published Version 1</div>
          <code style="font-size:11px; display:block; background:#f1f3f4; padding:6px; border-radius:4px; word-break:break-all;">/gtm.js?id=GTM-OPENSOURCE</code>
        </div>
        <div style="border:1px solid var(--border); border-radius:6px; padding:14px;">
          <div style="display:flex; justify-content:space-between;">
            <strong>Staging Environment</strong>
            <span class="badge badge-blue">Authenticated</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin: 8px 0;">Preview with gtm_auth token</div>
          <code style="font-size:11px; display:block; background:#f1f3f4; padding:6px; border-radius:4px; word-break:break-all;">/gtm.js?id=GTM-OPENSOURCE&gtm_auth=sec_99a8b1&gtm_preview=env_2</code>
        </div>
      </div>
    </div>
  `;

	el.querySelector(".btn-approve")?.addEventListener("click", () => {
		store.notifyUser(
			"Approval request #1 approved and marked Ready for Publish!",
			"success",
		);
	});

	el.querySelector(".btn-reject")?.addEventListener("click", () => {
		store.notifyUser(
			"Approval request #1 rejected with change requests sent to author.",
			"info",
		);
	});

	el.querySelector("#btn-add-zone")?.addEventListener("click", () => {
		store.notifyUser("Opening 360 Zone Configuration Wizard...", "info");
	});

	return el;
}
