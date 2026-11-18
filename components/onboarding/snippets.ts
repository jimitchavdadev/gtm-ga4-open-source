import type { OnboardingConfig } from "./types";

export function getWebSnippets(config: OnboardingConfig) {
	return {
		custom: `<!-- Open Source Tag Manager & Analytics (First-Party Cloaked) -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+dl:'';j.async=true;j.src=
'/tracker.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${config.containerId}');</script>
<!-- End Open Source Tag Manager & Analytics -->`,
		gtag: `<!-- Open Source GA4 Direct Ingestion -->
<script async src="/tracker.js?id=${config.measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${config.measurementId}');
</script>`,
		legacy: `<!-- Legacy GTM Compatibility Snippet -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+dl:'';j.async=true;j.src=
'/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${config.containerId}');</script>`,
		noscript: `<!-- Open Source Tag Manager (noscript) -->
<noscript>
  <iframe src="/_trk/ns.html?id=${config.containerId}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>`,
	};
}

export function getAndroidSnippets(config: OnboardingConfig) {
	const pkg = config.appPackageName || "com.example.analyticsapp";
	return {
		kotlin: `// Kotlin (Android) Analytics Dispatcher
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

object OpenAnalytics {
    private const val ENDPOINT = "https://your-analytics-domain.com/api/events/collect"
    private const val MEASUREMENT_ID = "${config.measurementId}"
    private val clientId = UUID.randomUUID().toString()

    fun logEvent(eventName: String, params: Map<String, String> = emptyMap()) {
        Thread {
            try {
                val query = StringBuilder("v=2")
                    .append("&tid=").append(MEASUREMENT_ID)
                    .append("&cid=").append(clientId)
                    .append("&en=").append(eventName)
                    .append("&aid=").append("${pkg}")
                    .append("&_p=android")
                params.forEach { (k, v) -> query.append("&ep.").append(k).append("=").append(v) }

                val conn = URL("$ENDPOINT?$query").openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.connectTimeout = 3000
                conn.responseCode // Emits hit
            } catch (e: Exception) { e.printStackTrace() }
        }.start()
    }
}`,
		mpBatch: `// Android Measurement Protocol Batch JSON
{
  "client_id": "35009a79-1a05-49d7-b876-2b884d0f825b",
  "app_instance_id": "d4e28f309a",
  "events": [
    {
      "name": "app_open",
      "params": {
        "app_name": "${config.streamName}",
        "package_name": "${pkg}",
        "engagement_time_msec": 100
      }
    }
  ]
}`,
	};
}

export function getIosSnippets(config: OnboardingConfig) {
	const bundle = config.bundleId || "com.example.analyticsapp";
	return {
		swift: `// Swift (iOS) Analytics Dispatcher
import Foundation

class OpenAnalytics {
    static let shared = OpenAnalytics()
    private let endpoint = "https://your-analytics-domain.com/api/events/collect"
    private let measurementId = "${config.measurementId}"
    private let clientId = UUID().uuidString

    func logEvent(name: String, parameters: [String: String] = [:]) {
        var components = URLComponents(string: endpoint)!
        var items = [
            URLQueryItem(name: "v", value: "2"),
            URLQueryItem(name: "tid", value: measurementId),
            URLQueryItem(name: "cid", value: clientId),
            URLQueryItem(name: "en", value: name),
            URLQueryItem(name: "bundle_id", value: "${bundle}"),
            URLQueryItem(name: "_p", value: "ios")
        ]
        parameters.forEach { items.append(URLQueryItem(name: "ep.\\($0.key)", value: $0.value)) }
        components.queryItems = items

        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"
        URLSession.shared.dataTask(with: request).resume()
    }
}`,
		mpBatch: `// iOS Measurement Protocol Batch JSON
{
  "client_id": "2b884d0f-1a05-49d7-b876-35009a79825b",
  "app_instance_id": "a930fd4e28",
  "events": [
    {
      "name": "app_open",
      "params": {
        "bundle_id": "${bundle}",
        "engagement_time_msec": 120
      }
    }
  ]
}`,
	};
}

export function getServerSnippets(config: OnboardingConfig) {
	return {
		curl: `# cURL Server-Side Hit Dispatch
curl -X POST "https://your-analytics-domain.com/api/events/batch?measurement_id=${config.measurementId}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "srv_client_99",
    "events": [
      {
        "name": "server_purchase",
        "params": { "currency": "USD", "value": 49.99 }
      }
    ]
  }'`,
		node: `// Node.js Server Event Ingestion
await fetch("https://your-analytics-domain.com/api/events/batch?measurement_id=${config.measurementId}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    client_id: "srv_client_99",
    events: [{ name: "conversion", params: { value: 100 } }]
  })
});`,
	};
}
