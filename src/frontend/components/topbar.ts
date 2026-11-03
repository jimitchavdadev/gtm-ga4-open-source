import { store } from "../state";

export function renderTopbar(): HTMLElement {
	const el = document.createElement("header");
	el.className = "topbar";
	const state = store.getState();

	const isGtm = state.platform === "GTM";

	el.innerHTML = `
    <div class="logo-group">
      <div style="font-weight: 700; font-size: 17px; display: flex; align-items: center; gap: 8px;">
        <span style="color: var(--primary); font-size: 20px;">⚡</span>
        <span>Analytics Platform</span>
      </div>
      <div class="platform-pill">
        <button id="switch-gtm" class="${isGtm ? "active" : ""}">Tag Manager</button>
        <button id="switch-ga4" class="${!isGtm ? "active" : ""}">Analytics (GA4)</button>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="font-size: 13px; color: var(--text-muted); background: #f1f3f4; padding: 4px 10px; border-radius: 4px;">
        ${
					isGtm
						? `Container: <strong>${state.containerId}</strong>`
						: `Property: <strong>${state.propertyId}</strong>`
				}
      </div>

      ${
				isGtm
					? `
        <button id="btn-top-preview" class="btn-secondary" style="display:flex; align-items:center; gap:6px;">
          <span>🔍</span> ${state.previewActive ? "Stop Preview" : "Preview"}
        </button>
        <button id="btn-top-submit" class="btn-primary">
          Submit
        </button>
      `
					: `
        <div style="display:flex; align-items:center; font-size:13px; font-weight:500;">
          <span class="pulse-circle"></span> Live Ingestion
        </div>
      `
			}
    </div>
  `;

	el.querySelector("#switch-gtm")?.addEventListener("click", () => {
		store.setState({ platform: "GTM" });
	});

	el.querySelector("#switch-ga4")?.addEventListener("click", () => {
		store.setState({ platform: "GA4" });
	});

	el.querySelector("#btn-top-preview")?.addEventListener("click", () => {
		const active = !store.getState().previewActive;
		store.setState({
			previewActive: active,
			gtmTab: active ? "PREVIEW" : "OVERVIEW",
		});
		store.notifyUser(
			active ? "Tag Assistant Preview Mode activated!" : "Preview Mode ended",
			"info",
		);
	});

	el.querySelector("#btn-top-submit")?.addEventListener("click", () => {
		// Open submit dialog
		const event = new CustomEvent("open-publish-modal");
		window.dispatchEvent(event);
	});

	return el;
}
