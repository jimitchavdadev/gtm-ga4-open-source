const devtoolsPorts = new Map();
const hitBuffer = [];

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "OPEN_ANALYTICS_PANEL") return;

  let panelTabId = null;

  port.onMessage.addListener((msg) => {
    if (msg.type === "INIT" && msg.tabId) {
      panelTabId = msg.tabId;
      devtoolsPorts.set(panelTabId, port);

      // Replay buffered hits for this tab
      const tabHits = hitBuffer.filter((h) => h.tabId === panelTabId);
      for (const h of tabHits) {
        port.postMessage(h);
      }
    }
  });

  port.onDisconnect.addListener(() => {
    if (panelTabId) {
      devtoolsPorts.delete(panelTabId);
    }
  });
});

// Relay messages from content script
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.source === "OPEN_ANALYTICS_CONTENT") {
    const tabId = sender.tab?.id;
    const packet = {
      tabId,
      timestamp: Date.now(),
      data: msg.payload,
    };

    hitBuffer.push(packet);
    if (hitBuffer.length > 500) hitBuffer.shift();

    if (tabId && devtoolsPorts.has(tabId)) {
      devtoolsPorts.get(tabId).postMessage(packet);
    }
  }
});
