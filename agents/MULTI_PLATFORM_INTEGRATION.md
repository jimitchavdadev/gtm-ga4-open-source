# Multi-Platform Client Integration Guide

This document provides copy-ready code snippets, SDK implementations, and wire protocol parameters for integrating **Web**, **Android**, **iOS**, and **Server** applications with the platform.

---

## 1. Web Integration (Browser)

Embed inside the `<head>` of all HTML pages.

### Option A: First-Party Tag Manager & Analytics (Recommended)
```html
<!-- Open Source Tag Manager & Analytics (First-Party Cloaked) -->
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+dl:'';j.async=true;j.src=
'/tracker.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-OPENSOURCE');
</script>
<!-- End Open Source Tag Manager & Analytics -->
```

### Option B: Direct GA4 Ingestion (gtag.js style)
```html
<!-- Open Source GA4 Direct Ingestion -->
<script async src="/tracker.js?id=G-TESTSTREAM"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TESTSTREAM');
</script>
```

### Option C: Noscript Fallback
Place immediately after opening `<body>` tag:
```html
<noscript>
  <iframe src="/_trk/ns.html?id=GTM-OPENSOURCE"
  height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
```

---

## 2. Android Integration (Kotlin)

Zero third-party SDK dependencies. Add this singleton to your Android project:

```kotlin
// OpenAnalytics.kt — Android Analytics Singleton
package com.example.app.analytics

import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

object OpenAnalytics {
    private const val ENDPOINT = "https://your-domain.com/api/events/collect"
    private const val MEASUREMENT_ID = "G-TESTSTREAM"
    private const val PACKAGE_NAME = "com.example.app"
    private val clientId = UUID.randomUUID().toString()

    fun logEvent(eventName: String, params: Map<String, String> = emptyMap()) {
        Thread {
            try {
                val query = StringBuilder("v=2")
                    .append("&tid=").append(MEASUREMENT_ID)
                    .append("&cid=").append(clientId)
                    .append("&en=").append(eventName)
                    .append("&_p=android")
                    .append("&aid=").append(PACKAGE_NAME)

                params.forEach { (k, v) ->
                    query.append("&ep.").append(k).append("=").append(v)
                }

                val conn = URL("$ENDPOINT?$query").openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.connectTimeout = 3000
                conn.responseCode // Triggers HTTP 204 ingestion
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }.start()
    }
}
```

### Usage:
```kotlin
// In MainActivity or Application class:
OpenAnalytics.logEvent("app_open")

// In Ecommerce checkout:
OpenAnalytics.logEvent("purchase", mapOf(
    "transaction_id" to "T_9876",
    "currency" to "USD",
    "value" to "49.99"
))
```

---

## 3. iOS Integration (Swift)

Uses native Swift `URLSession` with zero Cocoapods or SPM dependencies:

```swift
// OpenAnalytics.swift — iOS Analytics Singleton
import Foundation

class OpenAnalytics {
    static let shared = OpenAnalytics()
    private let endpoint = "https://your-domain.com/api/events/collect"
    private let measurementId = "G-TESTSTREAM"
    private let bundleId = "com.example.app"
    private let clientId = UUID().uuidString

    func logEvent(name: String, parameters: [String: String] = [:]) {
        var components = URLComponents(string: endpoint)!
        var items = [
            URLQueryItem(name: "v", value: "2"),
            URLQueryItem(name: "tid", value: measurementId),
            URLQueryItem(name: "cid", value: clientId),
            URLQueryItem(name: "en", value: name),
            URLQueryItem(name: "_p", value: "ios"),
            URLQueryItem(name: "bundle_id", value: bundleId)
        ]
        parameters.forEach { items.append(URLQueryItem(name: "ep.\($0.key)", value: $0.value)) }
        components.queryItems = items

        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"
        URLSession.shared.dataTask(with: request).resume()
    }
}
```

### Usage:
```swift
// In SwiftUI App or UIViewController:
OpenAnalytics.shared.logEvent(name: "app_open")

// In Purchase view:
OpenAnalytics.shared.logEvent(name: "purchase", parameters: [
    "currency": "USD",
    "value": "79.00"
])
```

---

## 4. Server-Side & Microservice Batch Ingestion

Dispatch batches from Node.js, Python, or Go microservices to `/api/events/batch`:

```bash
curl -X POST "https://your-domain.com/api/events/batch?measurement_id=G-TESTSTREAM&api_secret=sec_123" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "backend_worker_01",
    "events": [
      {
        "name": "subscription_renewed",
        "params": {
          "currency": "USD",
          "value": 19.99,
          "plan": "pro_annual"
        }
      }
    ]
  }'
```

---

## 5. Live Ingestion Verification Test

1. Open the dashboard at `http://localhost:3000`.
2. Click **"⚡ Setup Guide"** in the top navigation bar.
3. Choose your platform tab (**Web**, **Android**, **iOS**, or **Server**).
4. Jump to **Step 4: Live Verification** and click **"Send Test Ping"**.
5. Observe the live confirmation payload and inspect **Analytics (GA4) > Realtime** to verify active visitor metrics.
