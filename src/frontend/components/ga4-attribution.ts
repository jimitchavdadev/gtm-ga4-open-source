import { store } from "../state";

export function renderGa4Attribution(): HTMLElement {
	const el = document.createElement("div");
	const state = store.getState();
	const _attr = state.attributionData?.models || {
		lastClick: { "Organic Search": 40, "Paid Search": 35, Email: 25 },
		markovRemovalEffects: {
			"Paid Search": 0.45,
			"Organic Search": 0.35,
			Email: 0.2,
		},
		shapleyValueDDA: {
			"Paid Search": 0.42,
			"Organic Search": 0.38,
			Email: 0.2,
		},
	};

	el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
      <div>
        <div style="display:flex; align-items:center; gap:8px;">
          <h2 style="font-size: 20px; font-weight: 500;">Attribution Model Comparison</h2>
          <span class="badge badge-blue">DDA Engine</span>
        </div>
        <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Compare how different attribution models distribute conversion credit across touchpoints</p>
      </div>
      <div style="font-size:13px; color:var(--text-muted);">
        Reporting Window: <strong>90-Day Key Event Lookback</strong>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Cross-Channel Credit Distribution</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Channel Group</th>
            <th>Cross-Channel Last Click</th>
            <th>Markov Chain (Removal Effects)</th>
            <th>Data-Driven (Shapley Game Theory)</th>
            <th>% Variance (DDA vs Last Click)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Paid Search</strong></td>
            <td>35.0% ($3,500)</td>
            <td><strong>45.0%</strong> ($4,500)</td>
            <td><strong>42.0%</strong> ($4,200)</td>
            <td><span class="badge badge-green">+20.0% assist lift</span></td>
          </tr>
          <tr>
            <td><strong>Organic Search</strong></td>
            <td>40.0% ($4,000)</td>
            <td>35.0% ($3,500)</td>
            <td>38.0% ($3,800)</td>
            <td><span class="badge badge-yellow">-5.0%</span></td>
          </tr>
          <tr>
            <td><strong>Email Marketing</strong></td>
            <td>25.0% ($2,500)</td>
            <td>20.0% ($2,000)</td>
            <td>20.0% ($2,000)</td>
            <td><span class="badge badge-yellow">-20.0%</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Conversion Paths Visualizer -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Top Conversion Paths (Multi-Touch)</h3>
      </div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; gap:10px; background:#f8f9fa; padding:12px; border-radius:6px;">
          <span style="font-weight:700; width:24px;">1.</span>
          <span class="badge badge-blue">Paid Search</span> &rarr;
          <span class="badge badge-blue">Organic Search</span> &rarr;
          <span class="badge badge-blue">Email</span> &rarr;
          <span class="badge badge-green">Purchase ($129.50)</span>
          <span style="margin-left:auto; font-weight:600; font-size:13px;">32 conversions (43.8%)</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; background:#f8f9fa; padding:12px; border-radius:6px;">
          <span style="font-weight:700; width:24px;">2.</span>
          <span class="badge badge-blue">Organic Search</span> &rarr;
          <span class="badge badge-blue">Direct</span> &rarr;
          <span class="badge badge-green">Purchase ($99.00)</span>
          <span style="margin-left:auto; font-weight:600; font-size:13px;">24 conversions (32.9%)</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; background:#f8f9fa; padding:12px; border-radius:6px;">
          <span style="font-weight:700; width:24px;">3.</span>
          <span class="badge badge-blue">Paid Search</span> &rarr;
          <span class="badge badge-green">Purchase ($199.00)</span>
          <span style="margin-left:auto; font-weight:600; font-size:13px;">17 conversions (23.3%)</span>
        </div>
      </div>
    </div>
  `;

	return el;
}
