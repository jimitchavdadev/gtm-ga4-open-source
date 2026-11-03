import { ApiClient } from "../api";
import { store } from "../state";

export function renderGtmTriggers(): HTMLElement {
	const el = document.createElement("div");
	const state = store.getState();

	el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Triggers</h2>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">Triggers evaluate in response to events and determine when tags fire.</p>
        </div>
        <button id="btn-new-trigger" class="btn-primary">+ New Trigger</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Conditions</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="triggers-tbody">
          ${
						state.triggers.length === 0
							? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No triggers created yet. Click "+ New Trigger" to create one.</td></tr>`
							: state.triggers
									.map((t) => {
										const data = JSON.parse(t.data_json || "{}");
										return `
                <tr>
                  <td><strong>${t.name}</strong></td>
                  <td><span class="badge badge-yellow">${data.type || "PAGEVIEW"}</span></td>
                  <td>${data.condition || "All Events"}</td>
                  <td style="text-align:right;">
                    <button class="btn-danger btn-delete-trigger" data-id="${t.id}" style="padding:4px 8px; font-size:11px;">Delete</button>
                  </td>
                </tr>
              `;
									})
									.join("")
					}
        </tbody>
      </table>
    </div>

    <div id="trigger-modal-container"></div>
  `;

	el.querySelectorAll(".btn-delete-trigger").forEach((btn) => {
		btn.addEventListener("click", async (e) => {
			const id = (e.currentTarget as HTMLElement).dataset.id;
			if (!id) return;
			await ApiClient.deleteEntity(id);
			const updated = state.triggers.filter((t) => t.id !== id);
			store.setState({ triggers: updated });
			store.notifyUser("Trigger deleted", "info");
		});
	});

	el.querySelector("#btn-new-trigger")?.addEventListener("click", () => {
		const modalBox = el.querySelector("#trigger-modal-container");
		if (!modalBox) return;

		modalBox.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-box">
          <h3 style="margin-bottom: 16px;">Create New Trigger</h3>
          <div class="form-group">
            <label>Trigger Name</label>
            <input id="trig-name" type="text" placeholder="e.g. Purchase Event Trigger" value="Custom Event Trigger">
          </div>
          <div class="form-group">
            <label>Trigger Type</label>
            <select id="trig-type">
              <option value="CUSTOM_EVENT">Custom Event</option>
              <option value="PAGEVIEW">Page View</option>
              <option value="DOM_READY">DOM Ready</option>
              <option value="CLICK">Click - All Elements</option>
              <option value="TRIGGER_GROUP">Trigger Group</option>
            </select>
          </div>
          <div class="form-group">
            <label>Event Name</label>
            <input id="trig-event-name" type="text" placeholder="e.g. purchase, add_to_cart" value="purchase">
          </div>
          <div class="form-group">
            <label>Condition Filter</label>
            <input id="trig-condition" type="text" placeholder="e.g. {{Page Path}} contains /checkout" value="event equals purchase">
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button id="trig-cancel" class="btn-secondary">Cancel</button>
            <button id="trig-save" class="btn-primary">Save Trigger</button>
          </div>
        </div>
      </div>
    `;

		modalBox.querySelector("#trig-cancel")?.addEventListener("click", () => {
			modalBox.innerHTML = "";
		});

		modalBox.querySelector("#trig-save")?.addEventListener("click", async () => {
			const name = (modalBox.querySelector("#trig-name") as HTMLInputElement).value;
			const type = (modalBox.querySelector("#trig-type") as HTMLSelectElement).value;
			const condition = (modalBox.querySelector("#trig-condition") as HTMLInputElement).value;

			const created = await ApiClient.createEntity(state.workspaceId, {
				name,
				entity_type: "TRIGGER",
				data: { type, condition },
			});
			modalBox.innerHTML = "";
			store.setState({ triggers: [...state.triggers, created] });
			store.notifyUser(`Trigger "${name}" created!`, "success");
		});
	});

	return el;
}
