import { store } from "../state";

export function renderGtmPreview(): HTMLElement {
	const el = document.createElement("div");
	const state = store.getState();

	let selectedEventIndex = 2; // Default to Container Loaded

	const events = [
		{ id: 1, name: "Consent (default)", time: "0.00s", type: "consent" },
		{ id: 2, name: "Initialization (gtm.init)", time: "0.02s", type: "init" },
		{
			id: 3,
			name: "Container Loaded (gtm.js)",
			time: "0.05s",
			type: "pageview",
		},
		{ id: 4, name: "DOM Ready (gtm.dom)", time: "0.12s", type: "dom" },
		{ id: 5, name: "Window Loaded (gtm.load)", time: "0.25s", type: "window" },
		{ id: 6, name: "purchase", time: "1.42s", type: "custom" },
	];

	function updateView() {
		const ev = events[selectedEventIndex] || events[0];
		const isPurchase = ev?.name === "purchase";

		el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 500;">Tag Assistant (Preview & Debug)</h2>
          <p style="color:var(--text-muted); font-size:13px;">Connected to container ${state.containerId} on http://localhost:3000</p>
        </div>
        <button id="btn-push-test-event" class="btn-primary">+ Push Test Event (dataLayer)</button>
      </div>

      <div style="display: flex; gap: 20px; min-height: 480px;">
        <!-- Left: Event Timeline -->
        <div style="width: 260px; background: #fff; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;">
          <div style="padding: 12px 16px; background: #f8f9fa; border-bottom: 1px solid var(--border); font-weight: 500; font-size: 13px;">
            Summary & Event Timeline
          </div>
          <div id="events-list">
            ${events
							.map(
								(e, idx) => `
              <div class="event-item" data-idx="${idx}" style="padding:10px 16px; border-bottom:1px solid #f1f3f4; cursor:pointer; background:${selectedEventIndex === idx ? "#e8f0fe" : "#fff"}; color:${selectedEventIndex === idx ? "var(--primary)" : "inherit"}; font-weight:${selectedEventIndex === idx ? "600" : "400"}; display:flex; justify-content:space-between;">
                <span>${e.id}. ${e.name}</span>
                <span style="font-size:11px; color:var(--text-muted);">${e.time}</span>
              </div>
            `,
							)
							.join("")}
          </div>
        </div>

        <!-- Right: Inspector -->
        <div style="flex: 1; display:flex; flex-direction:column; gap:16px;">
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <h3 class="card-title">Tags Fired on Event: ${ev?.name}</h3>
            </div>
            <div>
              ${
								isPurchase || ev?.name.includes("Loaded")
									? `
                <div style="border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 10px; background: #fdfdfd;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>Google Analytics: GA4 Event Tag</strong>
                    <span class="badge badge-green">Fired 1 time</span>
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">
                    Trigger: <code>${isPurchase ? "Custom Event - purchase" : "All Pages"}</code> &bull; Priority: <code>10</code>
                  </div>
                </div>
              `
									: `<p style="color:var(--text-muted); font-size:13px;">No tags fired on this event.</p>`
							}
            </div>
          </div>

          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <h3 class="card-title">Data Layer & Evaluated Variables</h3>
            </div>
            <pre style="background:#202124; color:#34a853; padding:14px; border-radius:6px; font-size:12px; font-family:'Roboto Mono',monospace; overflow-x:auto;">${
							isPurchase
								? JSON.stringify(
										{
											event: "purchase",
											ecommerce: {
												transaction_id: "T_12345",
												value: 99.5,
												currency: "USD",
												items: [{ item_name: "Pro Subscription", price: 99.5 }],
											},
											uniqueEventId: 6,
										},
										null,
										2,
									)
								: JSON.stringify(
										{
											event: ev?.name || "gtm.js",
											"gtm.start": Date.now() - 500,
											page_location: "http://localhost:3000/shop",
											uniqueEventId: ev?.id || 1,
										},
										null,
										2,
									)
						}</pre>
          </div>
        </div>
      </div>
    `;

		el.querySelectorAll(".event-item").forEach((item) => {
			item.addEventListener("click", (e) => {
				selectedEventIndex = Number(
					(e.currentTarget as HTMLElement).dataset.idx,
				);
				updateView();
			});
		});

		el.querySelector("#btn-push-test-event")?.addEventListener("click", () => {
			store.notifyUser(
				"Pushed { event: 'custom_conversion' } to dataLayer!",
				"success",
			);
			events.push({
				id: events.length + 1,
				name: "custom_conversion",
				time: "2.10s",
				type: "custom",
			});
			selectedEventIndex = events.length - 1;
			updateView();
		});
	}

	updateView();
	return el;
}
