(function () {
  // Inject the page script
  try {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injected.js");
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {
    console.error("OpenAnalytics: Failed to inject script", e);
  }

  // Relay messages from page script to background / DevTools
  window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data) return;
    if (event.data.source === "OPEN_ANALYTICS_DEBUGGER") {
      chrome.runtime.sendMessage({
        source: "OPEN_ANALYTICS_CONTENT",
        payload: event.data,
      });
    }
  });
})();
