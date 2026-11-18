"use client";

import { useState } from "react";
import type { OnboardingConfig } from "./types";

interface Step2Props {
	config: OnboardingConfig;
}

export function OnboardingStep2Snippet({ config }: Step2Props) {
	const [activeTab, setActiveTab] = useState<
		"custom" | "gtag" | "legacy" | "noscript"
	>("custom");
	const [copied, setCopied] = useState(false);

	const snippets = {
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

	const currentSnippet = snippets[activeTab];

	const handleCopy = async () => {
		await navigator.clipboard.writeText(currentSnippet);
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	};

	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-base font-semibold text-gray-900">
					2. Install Web Tracking Snippet
				</h4>
				<p className="text-xs text-gray-500">
					Copy the embed snippet and paste it into the <code>&lt;head&gt;</code>{" "}
					of your website.
				</p>
			</div>

			<div className="flex border-b border-gray-200">
				<button
					type="button"
					onClick={() => setActiveTab("custom")}
					className={`border-b-2 px-3 py-1.5 text-xs font-semibold ${
						activeTab === "custom"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700"
					}`}
				>
					⚡ First-Party /tracker.js (Recommended)
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("gtag")}
					className={`border-b-2 px-3 py-1.5 text-xs font-semibold ${
						activeTab === "gtag"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700"
					}`}
				>
					Direct GA4 (gtag)
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("legacy")}
					className={`border-b-2 px-3 py-1.5 text-xs font-semibold ${
						activeTab === "legacy"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700"
					}`}
				>
					Legacy /gtm.js
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("noscript")}
					className={`border-b-2 px-3 py-1.5 text-xs font-semibold ${
						activeTab === "noscript"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700"
					}`}
				>
					&lt;noscript&gt; Fallback
				</button>
			</div>

			<div className="relative rounded-lg border border-gray-800 bg-gray-900 p-3 font-mono text-xs text-gray-200">
				<button
					type="button"
					onClick={handleCopy}
					className="absolute right-3 top-3 rounded-md bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-500"
				>
					{copied ? "✓ Copied!" : "📋 Copy Snippet"}
				</button>
				<pre className="overflow-x-auto pr-24 leading-relaxed">
					<code>{currentSnippet}</code>
				</pre>
			</div>

			<div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900">
				<strong className="font-semibold">🛡️ Zero Ad-Block Dropoff:</strong>{" "}
				Because <code>/tracker.js</code> is served directly from your
				application domain, tracking scripts are never blocked by uBlock Origin,
				Brave Shields, or Safari ITP restrictions.
			</div>
		</div>
	);
}
