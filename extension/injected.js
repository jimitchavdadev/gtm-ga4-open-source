(function () {
  if (window.__OPEN_ANALYTICS_INJECTED__) return;
  window.__OPEN_ANALYTICS_INJECTED__ = true;

  function broadcast(type, data) {
    window.postMessage(
      {
        source: "OPEN_ANALYTICS_DEBUGGER",
        type,
        timestamp: Date.now(),
        data,
      },
      "*"
    );
  }

  // 1. Intercept window.dataLayer
  function hookDataLayer(dl) {
    if (!dl || dl.__hooked__) return;
    dl.__hooked__ = true;
    const origPush = dl.push;
    dl.push = function (...args) {
      for (const arg of args) {
        broadcast("DATALAYER_PUSH", arg);
      }
      return origPush.apply(this, args);
    };
  }

  if (window.dataLayer) {
    hookDataLayer(window.dataLayer);
  } else {
    let dlVal = [];
    Object.defineProperty(window, "dataLayer", {
      configurable: true,
      enumerable: true,
      get() {
        return dlVal;
      },
      set(val) {
        dlVal = val;
        hookDataLayer(dlVal);
      },
    });
  }

  // 2. Intercept window.fetch
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
    if (isAnalyticsUrl(url)) {
      broadcast("NETWORK_HIT", {
        method: args[1]?.method || "GET",
        url,
        body: args[1]?.body || null,
      });
    }
    return origFetch.apply(this, args);
  };

  // 3. Intercept XMLHttpRequest
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__reqUrl = url;
    this.__reqMethod = method;
    return origOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (this.__reqUrl && isAnalyticsUrl(this.__reqUrl)) {
      broadcast("NETWORK_HIT", {
        method: this.__reqMethod,
        url: this.__reqUrl,
        body,
      });
    }
    return origSend.call(this, body);
  };

  function isAnalyticsUrl(url) {
    return (
      url.includes("/g/collect") ||
      url.includes("/mp/collect") ||
      url.includes("/_trk/") ||
      url.includes("google-analytics.com") ||
      url.includes("googletagmanager.com")
    );
  }
})();
