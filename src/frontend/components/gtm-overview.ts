import { ApiClient } from "../api";
import { store } from "../state";

export function renderGtmOverview(): HTMLElement {
	const el = document.createElement("div");
	const state = store.getState();
	const tagsCount = state.tags.length;
	const triggersCount = state.triggers.length;
	const variablesCount = state.variables.length;

	el.innerHTML = `
    <div class="card" style="border-top: 4px solid var(--primary);">
      <div class="card-header">
        <div>
          <h2 class="card-title">Default Workspace</h2>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">Main working environment for container changes</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="btn-publish-workspace" class="btn-primary">Publish to Live</button>
        </div>
      </div>

      <div class="grid-kpis" style="margin-bottom: 0;">
        <div class="kpi-card" style="border-left-color: #1a73e8;">
          <div class="kpi-label">Configured Tags</div>
          <div class="kpi-value">${tagsCount}</div>
        </div>
        <div class="kpi-card" style="border-left-color: #1e8e3e;">
          <div class="kpi-label">Firing Triggers</div>
          <div class="kpi-value">${triggersCount}</div>
        </div>
        <div class="kpi-card" style="border-left-color: #f9ab00;">
          <div class="kpi-label">Variables & Macros</div>
          <div class="kpi-value">${variablesCount}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Published Container Versions</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Version</th>
            <th>Name</th>
            <th>Description</th>
            <th>Published At</th>
          </tr>
        </thead>
        <tbody id="versions-tbody">
          ${
						state.versions.length === 0
							? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No published versions yet. Click "Publish to Live" to create Version 1.</td></tr>`
							: state.versions
									.map(
										(v) => `
                <tr>
                  <td><strong>v${v.version_number}</strong></td>
                  <td>${v.name || "Untitled"}</td>
                  <td>${v.description || "-"}</td>
                  <td>${new Date(v.created_at).toLocaleString()}</td>
                </tr>
              `,
									)
									.join("")
					}
        </tbody>
      </table>
    </div>

    <div id="publish-modal-container"></div>
  `;

	const openModal = () => {
		const modalBox = el.querySelector("#publish-modal-container");
		if (!modalBox) return;
		modalBox.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-box">
          <h3 style="margin-bottom: 16px;">Publish Container Version</h3>
          <div class="form-group">
            <label>Version Name</label>
            <input id="pub-ver-name" type="text" placeholder="e.g. Initial GA4 Setup" value="Release v${(state.versions.length || 0) + 1}">
          </div>
          <div class="form-group">
            <label>Version Description</label>
            <textarea id="pub-ver-desc" rows="3" placeholder="Describe the tags, triggers, or changes included..."></textarea>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button id="pub-cancel" class="btn-secondary">Cancel</button>
            <button id="pub-confirm" class="btn-primary">Publish</button>
          </div>
        </div>
      </div>
    `;

		modalBox.querySelector("#pub-cancel")?.addEventListener("click", () => {
			modalBox.innerHTML = "";
		});

		modalBox.querySelector("#pub-confirm")?.addEventListener("click", async () => {
			const nameInput = modalBox.querySelector("#pub-ver-name") as HTMLInputElement;
			const descInput = modalBox.querySelector("#pub-ver-desc") as HTMLTextAreaElement;
			const ver = await ApiClient.publishWorkspace(
				state.workspaceId,
				state.containerId,
				nameInput?.value || "Live Release",
				descInput?.value || "",
			);
			modalBox.innerHTML = "";
			store.setState({ versions: [ver, ...state.versions] });
			store.notifyUser(`Version ${ver.version_number} successfully published!`, "success");
		});
	};

	el.querySelector("#btn-publish-workspace")?.addEventListener("click", openModal);
	window.addEventListener("open-publish-modal", openModal);

	return el;
}
