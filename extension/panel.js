const events = [];
let selectedIndex = -1;
const eventListEl = document.getElementById("event-list");
const detailsPanelEl = document.getElementById("details-panel");
const filterInputEl = document.getElementById("filter-input");

const port = chrome.runtime.connect({ name: "OPEN_ANALYTICS_PANEL" });
port.postMessage({ type: "INIT", tabId: chrome.devtools.inspectedWindow.tabId });

port.onMessage.addListener((packet) => {
  const item = parseIncomingPacket(packet);
  events.push(item);
  renderEventList();
  if (selectedIndex === -1) selectEvent(0);
});

function parseIncomingPacket(packet) {
  const payload = packet.data || {};
  let eventName = "Unknown";
  let params = {};
  let typeBadge = payload.type === "DATALAYER_PUSH" ? "DataLayer" : "GA4 Hit";

  if (payload.type === "DATALAYER_PUSH") {
    eventName = payload.data?.event || "dataLayer.set";
    params = payload.data || {};
  } else if (payload.type === "NETWORK_HIT") {
    const url = new URL(payload.data?.url || "http://localhost");
    url.searchParams.forEach((v, k) => { params[k] = v; });
    eventName = params.en || (url.pathname.includes("/mp/collect") ? "mp_collect" : "collect");
  }

  return { id: events.length, eventName, typeBadge, params, raw: payload, time: new Date().toLocaleTimeString() };
}

function renderEventList() {
  const query = filterInputEl.value.toLowerCase();
  eventListEl.innerHTML = "";

  events.forEach((ev, idx) => {
    if (query && !ev.eventName.toLowerCase().includes(query)) return;

    const div = document.createElement("div");
    div.className = `event-item ${idx === selectedIndex ? "selected" : ""}`;
    div.innerHTML = `
      <div>
        <div class="event-name">${ev.eventName}</div>
        <div style="font-size:10px;color:#94a3b8">${ev.time}</div>
      </div>
      <span class="event-badge ${ev.typeBadge === 'DataLayer' ? 'badge-dlv' : 'badge-network'}">${ev.typeBadge}</span>
    `;
    div.onclick = () => selectEvent(idx);
    eventListEl.appendChild(div);
  });
}

function selectEvent(idx) {
  selectedIndex = idx;
  renderEventList();
  const ev = events[idx];
  if (!ev) return;

  const gcs = ev.params.gcs || "G1--";
  const adConsent = gcs[2] === "1" ? "Granted" : "Denied";
  const anaConsent = gcs[3] === "1" ? "Granted" : "Denied";

  let paramRows = Object.entries(ev.params)
    .map(([k, v]) => `<tr><td>${k}</td><td>${typeof v === "object" ? JSON.stringify(v) : v}</td></tr>`)
    .join("");

  detailsPanelEl.innerHTML = `
    <div class="card">
      <div class="card-title">Event Overview: ${ev.eventName}</div>
      <table class="param-table">
        <tr><th>Timestamp</th><td>${ev.time}</td></tr>
        <tr><th>Type</th><td>${ev.typeBadge}</td></tr>
        ${ev.params.tid ? `<tr><th>Measurement ID</th><td>${ev.params.tid}</td></tr>` : ""}
        ${ev.params.cid ? `<tr><th>Client ID</th><td>${ev.params.cid}</td></tr>` : ""}
        ${ev.params.sid ? `<tr><th>Session ID</th><td>${ev.params.sid}</td></tr>` : ""}
      </table>
    </div>

    <div class="card">
      <div class="card-title">Consent Mode v2 Signals</div>
      <div class="consent-grid">
        <div class="consent-box"><span>ad_storage</span><span class="${adConsent === 'Granted' ? 'status-granted' : 'status-denied'}">${adConsent}</span></div>
        <div class="consent-box"><span>analytics_storage</span><span class="${anaConsent === 'Granted' ? 'status-granted' : 'status-denied'}">${anaConsent}</span></div>
      </div>
      ${ev.params.gcd ? `<div style="margin-top:8px;font-family:monospace;font-size:11px;color:#64748b">gcd: ${ev.params.gcd}</div>` : ""}
    </div>

    <div class="card">
      <div class="card-title">All Parameters & Payload</div>
      <table class="param-table">
        <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
        <tbody>${paramRows || "<tr><td colspan='2'>No parameters</td></tr>"}</tbody>
      </table>
    </div>
  `;
}

document.getElementById("clear-btn").onclick = () => {
  events.length = 0;
  selectedIndex = -1;
  renderEventList();
  detailsPanelEl.innerHTML = '<div class="empty-state">Events cleared. Waiting for new hits...</div>';
};

document.getElementById("export-btn").onclick = () => {
  const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `openanalytics_trace_${Date.now()}.json`;
  a.click();
};

filterInputEl.oninput = () => renderEventList();
