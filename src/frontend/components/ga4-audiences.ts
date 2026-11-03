import { store } from "../state";

export function renderGa4Audiences(): HTMLElement {
	const el = document.createElement("div");

	el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
      <div>
        <div style="display:flex; align-items:center; gap:8px;">
          <h2 style="font-size: 20px; font-weight: 500;">Audiences & Predictive Segments</h2>
          <span class="badge badge-blue">Machine Learning</span>
        </div>
        <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Segment users based on dimensions, metrics, and predictive purchase models</p>
      </div>
      <button id="btn-create-aud" class="btn-primary">+ New Audience</button>
    </div>

    <!-- Predictive Audiences Grid -->
    <div class="card" style="border-top: 4px solid var(--primary);">
      <div class="card-header">
        <h3 class="card-title">Predictive Machine Learning Templates</h3>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
        <div style="border:1px solid var(--border); border-radius:6px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>Likely 7-day purchasers</strong>
            <span class="badge badge-green">Ready</span>
          </div>
          <p style="font-size:12px; color:var(--text-muted); margin: 8px 0;">Users likely to purchase in the next 7 days based on ML behavioral model.</p>
          <div style="font-size:13px;">Estimated Size: <strong>140 users</strong></div>
        </div>
        <div style="border:1px solid var(--border); border-radius:6px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>Likely 7-day churning purchasers</strong>
            <span class="badge badge-yellow">Targeting</span>
          </div>
          <p style="font-size:12px; color:var(--text-muted); margin: 8px 0;">Purchasers unlikely to return in the next 7 days. Ideal for win-back campaigns.</p>
          <div style="font-size:13px;">Estimated Size: <strong>85 users</strong></div>
        </div>
        <div style="border:1px solid var(--border); border-radius:6px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>Predicted 28-day top spenders</strong>
            <span class="badge badge-blue">VIP</span>
          </div>
          <p style="font-size:12px; color:var(--text-muted); margin: 8px 0;">Users predicted to generate the top 20% of revenue in the next 28 days.</p>
          <div style="font-size:13px;">Estimated Size: <strong>55 users</strong></div>
        </div>
      </div>
    </div>

    <!-- Active Audiences Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Configured Audiences</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Audience Name</th>
            <th>Description</th>
            <th>Membership Duration</th>
            <th>Audience Trigger</th>
            <th>Users Count</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>All Users</strong></td>
            <td>Default audience containing every engaged user</td>
            <td>30 days</td>
            <td>-</td>
            <td><strong>650</strong></td>
          </tr>
          <tr>
            <td><strong>Purchasers</strong></td>
            <td>Users who have triggered a purchase key event</td>
            <td>90 days</td>
            <td><code>vip_member_created</code></td>
            <td><strong>73</strong></td>
          </tr>
          <tr>
            <td><strong>Cart Abandoners</strong></td>
            <td>Users with add_to_cart but without purchase in same session</td>
            <td>30 days</td>
            <td><code>cart_abandoned_trigger</code></td>
            <td><strong>112</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

	el.querySelector("#btn-create-aud")?.addEventListener("click", () => {
		store.notifyUser("Opening Audience Builder dialog...", "info");
	});

	return el;
}
