import { ApiClient } from "../api";
import { store } from "../state";

export function renderGtmVariables(): HTMLElement {
	const el = document.createElement("div");
	const state = store.getState();

	el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Built-in Variables</h3>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> Page URL</label>
        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> Page Path</label>
        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> Event</label>
        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> Click Element</label>
        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> Click Classes</label>
        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> Click ID</label>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">User-Defined Variables</h2>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">Dynamic named placeholders whose values are populated at runtime.</p>
        </div>
        <button id="btn-new-var" class="btn-primary">+ New Variable</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Data Layer / Path</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="vars-tbody">
          ${
						state.variables.length === 0
							? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No user-defined variables yet. Click "+ New Variable" to add one.</td></tr>`
							: state.variables
									.map((v) => {
										const data = JSON.parse(v.data_json || "{}");
										return `
                <tr>
                  <td><strong>{{${v.name}}}</strong></td>
                  <td><span class="badge badge-blue">${data.type || "DATA_LAYER"}</span></td>
                  <td><code>${data.path || "-"}</code></td>
                  <td style="text-align:right;">
                    <button class="btn-danger btn-delete-var" data-id="${v.id}" style="padding:4px 8px; font-size:11px;">Delete</button>
                  </td>
                </tr>
              `;
									})
									.join("")
					}
        </tbody>
      </table>
    </div>

    <div id="var-modal-container"></div>
  `;

	el.querySelectorAll(".btn-delete-var").forEach((btn) => {
		btn.addEventListener("click", async (e) => {
			const id = (e.currentTarget as HTMLElement).dataset.id;
			if (!id) return;
			await ApiClient.deleteEntity(id);
			const updated = state.variables.filter((v) => v.id !== id);
			store.setState({ variables: updated });
			store.notifyUser("Variable deleted", "info");
		});
	});

	el.querySelector("#btn-new-var")?.addEventListener("click", () => {
		const modalBox = el.querySelector("#var-modal-container");
		if (!modalBox) return;

		modalBox.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-box">
          <h3 style="margin-bottom: 16px;">Create User-Defined Variable</h3>
          <div class="form-group">
            <label>Variable Name</label>
            <input id="var-name" type="text" placeholder="e.g. dlv - ecommerce.value" value="dlv - value">
          </div>
          <div class="form-group">
            <label>Variable Type</label>
            <select id="var-type">
              <option value="DATA_LAYER">Data Layer Variable</option>
              <option value="1ST_PARTY_COOKIE">1st Party Cookie</option>
              <option value="URL">URL Variable</option>
              <option value="CUSTOM_JS">Custom JavaScript</option>
              <option value="CONSTANT">Constant</option>
            </select>
          </div>
          <div class="form-group">
            <label>Path / Key / Value</label>
            <input id="var-path" type="text" placeholder="e.g. ecommerce.value" value="ecommerce.value">
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button id="var-cancel" class="btn-secondary">Cancel</button>
            <button id="var-save" class="btn-primary">Save Variable</button>
          </div>
        </div>
      </div>
    `;

		modalBox.querySelector("#var-cancel")?.addEventListener("click", () => {
			modalBox.innerHTML = "";
		});

		modalBox.querySelector("#var-save")?.addEventListener("click", async () => {
			const name = (modalBox.querySelector("#var-name") as HTMLInputElement).value;
			const type = (modalBox.querySelector("#var-type") as HTMLSelectElement).value;
			const path = (modalBox.querySelector("#var-path") as HTMLInputElement).value;

			const created = await ApiClient.createEntity(state.workspaceId, {
				name,
				entity_type: "VARIABLE",
				data: { type, path },
			});
			modalBox.innerHTML = "";
			store.setState({ variables: [...state.variables, created] });
			store.notifyUser(`Variable "{{${name}}}" created!`, "success");
		});
	});

	return el;
}
