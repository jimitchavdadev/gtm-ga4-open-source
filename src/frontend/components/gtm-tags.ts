import { ApiClient } from "../api";
import { store } from "../state";

export function renderGtmTags(): HTMLElement {
	const el = document.createElement("div");
	const state = store.getState();

	el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h2 class="card-title">Tags</h2>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">Tags execute code or send measurement hits to third-party endpoints.</p>
        </div>
        <button id="btn-new-tag" class="btn-primary">+ New Tag</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Firing Trigger</th>
            <th>Priority</th>
            <th>Consent Requirement</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="tags-tbody">
          ${
						state.tags.length === 0
							? `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No tags created yet. Click "+ New Tag" to create one.</td></tr>`
							: state.tags
									.map((t) => {
										const data = JSON.parse(t.data_json || "{}");
										return `
                <tr>
                  <td><strong>${t.name}</strong></td>
                  <td><span class="badge badge-blue">${data.type || "GA4_EVENT"}</span></td>
                  <td>${data.triggerName || "All Pages"}</td>
                  <td>${data.priority || 0}</td>
                  <td><span class="badge badge-green">${data.requiredConsent || "analytics_storage"}</span></td>
                  <td style="text-align:right;">
                    <button class="btn-danger btn-delete-tag" data-id="${t.id}" style="padding:4px 8px; font-size:11px;">Delete</button>
                  </td>
                </tr>
              `;
									})
									.join("")
					}
        </tbody>
      </table>
    </div>

    <div id="tag-modal-container"></div>
  `;

	el.querySelectorAll(".btn-delete-tag").forEach((btn) => {
		btn.addEventListener("click", async (e) => {
			const id = (e.currentTarget as HTMLElement).dataset.id;
			if (!id) return;
			await ApiClient.deleteEntity(id);
			const updated = state.tags.filter((t) => t.id !== id);
			store.setState({ tags: updated });
			store.notifyUser("Tag deleted", "info");
		});
	});

	el.querySelector("#btn-new-tag")?.addEventListener("click", () => {
		const modalBox = el.querySelector("#tag-modal-container");
		if (!modalBox) return;

		modalBox.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-box">
          <h3 style="margin-bottom: 16px;">Create New Tag</h3>
          <div class="form-group">
            <label>Tag Name</label>
            <input id="tag-name" type="text" placeholder="e.g. GA4 - Purchase Event" value="GA4 Event Tag">
          </div>
          <div class="form-group">
            <label>Tag Type</label>
            <select id="tag-type">
              <option value="GA4_EVENT">Google Analytics: GA4 Event</option>
              <option value="GA4_CONFIG">Google Tag / GA4 Configuration</option>
              <option value="CUSTOM_HTML">Custom HTML</option>
              <option value="GOOGLE_ADS">Google Ads Conversion Tracking</option>
            </select>
          </div>
          <div class="form-group">
            <label>Firing Trigger</label>
            <select id="tag-trigger">
              <option value="All Pages">Initialization - All Pages</option>
              <option value="Purchase Event">Custom Event - purchase</option>
              <option value="Click Links">Just Links Click</option>
            </select>
          </div>
          <div class="form-group">
            <label>Firing Priority (higher fires first)</label>
            <input id="tag-priority" type="number" value="10">
          </div>
          <div class="form-group">
            <label>Required Consent</label>
            <select id="tag-consent">
              <option value="analytics_storage">analytics_storage</option>
              <option value="ad_storage">ad_storage</option>
              <option value="ad_user_data">ad_user_data</option>
              <option value="ad_personalization">ad_personalization</option>
            </select>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button id="tag-cancel" class="btn-secondary">Cancel</button>
            <button id="tag-save" class="btn-primary">Save Tag</button>
          </div>
        </div>
      </div>
    `;

		modalBox.querySelector("#tag-cancel")?.addEventListener("click", () => {
			modalBox.innerHTML = "";
		});

		modalBox.querySelector("#tag-save")?.addEventListener("click", async () => {
			const name = (modalBox.querySelector("#tag-name") as HTMLInputElement).value;
			const type = (modalBox.querySelector("#tag-type") as HTMLSelectElement).value;
			const triggerName = (modalBox.querySelector("#tag-trigger") as HTMLSelectElement).value;
			const priority = Number((modalBox.querySelector("#tag-priority") as HTMLInputElement).value) || 0;
			const requiredConsent = (modalBox.querySelector("#tag-consent") as HTMLSelectElement).value;

			const created = await ApiClient.createEntity(state.workspaceId, {
				name,
				entity_type: "TAG",
				data: { type, triggerName, priority, requiredConsent },
			});
			modalBox.innerHTML = "";
			store.setState({ tags: [...state.tags, created] });
			store.notifyUser(`Tag "${name}" created successfully!`, "success");
		});
	});

	return el;
}
