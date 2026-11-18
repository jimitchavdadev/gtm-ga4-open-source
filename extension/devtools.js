chrome.devtools.panels.create(
  "OpenAnalytics",
  "icon16.png",
  "panel.html",
  (panel) => {
    panel.onShown.addListener((panelWindow) => {
      panelWindow.postMessage(
        { type: "PANEL_SHOWN", tabId: chrome.devtools.inspectedWindow.tabId },
        "*"
      );
    });
  }
);
