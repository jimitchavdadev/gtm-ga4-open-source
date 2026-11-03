export function renderGa4Reports(): HTMLElement {
	const el = document.createElement("div");
	let activeSubTab: "ACQUISITION" | "ENGAGEMENT" | "MONETIZATION" | "TECH" =
		"ACQUISITION";

	function render() {
		el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 500;">Life Cycle & User Reports</h2>
          <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Explore how users find and interact with your digital properties</p>
        </div>
        <div class="platform-pill">
          <button id="tab-acq" class="${activeSubTab === "ACQUISITION" ? "active" : ""}">Traffic Acquisition</button>
          <button id="tab-eng" class="${activeSubTab === "ENGAGEMENT" ? "active" : ""}">Engagement & Events</button>
          <button id="tab-mon" class="${activeSubTab === "MONETIZATION" ? "active" : ""}">Monetization</button>
          <button id="tab-tech" class="${activeSubTab === "TECH" ? "active" : ""}">Tech & Devices</button>
        </div>
      </div>

      ${
				activeSubTab === "ACQUISITION"
					? `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Traffic Acquisition by Session Default Channel Group</h3></div>
          <table class="data-table">
            <thead><tr><th>Session Default Channel Group</th><th>Users</th><th>Sessions</th><th>Engaged Sessions</th><th>Engagement Rate</th><th>Conversions</th></tr></thead>
            <tbody>
              <tr><td><strong>Organic Search</strong></td><td>412</td><td>520</td><td>390</td><td>75.0%</td><td>18</td></tr>
              <tr><td><strong>Direct</strong></td><td>280</td><td>310</td><td>215</td><td>69.4%</td><td>12</td></tr>
              <tr><td><strong>Paid Search (Google Ads)</strong></td><td>195</td><td>240</td><td>185</td><td>77.1%</td><td>24</td></tr>
              <tr><td><strong>Email Marketing</strong></td><td>110</td><td>145</td><td>120</td><td>82.8%</td><td>15</td></tr>
              <tr><td><strong>Referral</strong></td><td>65</td><td>78</td><td>52</td><td>66.7%</td><td>4</td></tr>
            </tbody>
          </table>
        </div>
      `
					: ""
			}

      ${
				activeSubTab === "ENGAGEMENT"
					? `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Events & Conversions</h3></div>
          <table class="data-table">
            <thead><tr><th>Event Name</th><th>Event Count</th><th>Total Users</th><th>Event Count per User</th><th>Key Event (Conversion)</th></tr></thead>
            <tbody>
              <tr><td><strong>page_view</strong></td><td>1,420</td><td>650</td><td>2.18</td><td>No</td></tr>
              <tr><td><strong>session_start</strong></td><td>890</td><td>650</td><td>1.37</td><td>No</td></tr>
              <tr><td><strong>view_item</strong></td><td>410</td><td>280</td><td>1.46</td><td>No</td></tr>
              <tr><td><strong>add_to_cart</strong></td><td>185</td><td>140</td><td>1.32</td><td>No</td></tr>
              <tr><td><strong>purchase</strong></td><td>73</td><td>68</td><td>1.07</td><td><span class="badge badge-green">Key Event</span></td></tr>
            </tbody>
          </table>
        </div>
      `
					: ""
			}

      ${
				activeSubTab === "MONETIZATION"
					? `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Ecommerce Purchases & Items Revenue</h3></div>
          <table class="data-table">
            <thead><tr><th>Item Name</th><th>Item Views</th><th>Add-to-Carts</th><th>Cart-to-View Rate</th><th>Purchases</th><th>Item Revenue</th></tr></thead>
            <tbody>
              <tr><td><strong>Pro Analytics Cloud</strong></td><td>340</td><td>95</td><td>27.9%</td><td>42</td><td>$4,158.00</td></tr>
              <tr><td><strong>Enterprise Self-Hosted License</strong></td><td>180</td><td>45</td><td>25.0%</td><td>21</td><td>$10,479.00</td></tr>
              <tr><td><strong>Developer Support Plan</strong></td><td>120</td><td>32</td><td>26.7%</td><td>10</td><td>$990.00</td></tr>
            </tbody>
          </table>
        </div>
      `
					: ""
			}

      ${
				activeSubTab === "TECH"
					? `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Users by Device Category & Operating System</h3></div>
          <table class="data-table">
            <thead><tr><th>Device Category</th><th>Operating System</th><th>Users</th><th>Engagement Rate</th></tr></thead>
            <tbody>
              <tr><td><strong>Desktop</strong></td><td>Linux / macOS / Windows</td><td>580</td><td>78.2%</td></tr>
              <tr><td><strong>Mobile</strong></td><td>Android / iOS</td><td>260</td><td>65.4%</td></tr>
              <tr><td><strong>Tablet</strong></td><td>iPadOS / Android Tablet</td><td>50</td><td>62.0%</td></tr>
            </tbody>
          </table>
        </div>
      `
					: ""
			}
    `;

		el.querySelector("#tab-acq")?.addEventListener("click", () => {
			activeSubTab = "ACQUISITION";
			render();
		});
		el.querySelector("#tab-eng")?.addEventListener("click", () => {
			activeSubTab = "ENGAGEMENT";
			render();
		});
		el.querySelector("#tab-mon")?.addEventListener("click", () => {
			activeSubTab = "MONETIZATION";
			render();
		});
		el.querySelector("#tab-tech")?.addEventListener("click", () => {
			activeSubTab = "TECH";
			render();
		});
	}

	render();
	return el;
}
