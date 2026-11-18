"use client";

import { useState } from "react";
import {
	getAndroidSnippets,
	getIosSnippets,
	getServerSnippets,
	getWebSnippets,
} from "./snippets";
import type { OnboardingConfig } from "./types";

interface Step2Props {
	config: OnboardingConfig;
}

export function OnboardingStep2Snippet({ config }: Step2Props) {
	const [activeSubTab, setActiveSubTab] = useState<string>("primary");
	const [copied, setCopied] = useState(false);

	const webSnippets = getWebSnippets(config);
	const androidSnippets = getAndroidSnippets(config);
	const iosSnippets = getIosSnippets(config);
	const serverSnippets = getServerSnippets(config);

	let currentSnippet = "";
	let subTabs: { id: string; label: string }[] = [];

	if (config.platformType === "web") {
		subTabs = [
			{ id: "primary", label: "⚡ First-Party /tracker.js" },
			{ id: "gtag", label: "Direct GA4 (gtag)" },
			{ id: "legacy", label: "Legacy /gtm.js" },
			{ id: "noscript", label: "<noscript> Fallback" },
		];
		if (activeSubTab === "gtag") currentSnippet = webSnippets.gtag;
		else if (activeSubTab === "legacy") currentSnippet = webSnippets.legacy;
		else if (activeSubTab === "noscript") currentSnippet = webSnippets.noscript;
		else currentSnippet = webSnippets.custom;
	} else if (config.platformType === "android") {
		subTabs = [
			{ id: "primary", label: "🤖 Kotlin Dispatcher" },
			{ id: "batch", label: "Batch JSON (MPv2)" },
		];
		currentSnippet =
			activeSubTab === "batch"
				? androidSnippets.mpBatch
				: androidSnippets.kotlin;
	} else if (config.platformType === "ios") {
		subTabs = [
			{ id: "primary", label: "🍎 Swift Dispatcher" },
			{ id: "batch", label: "Batch JSON (MPv2)" },
		];
		currentSnippet =
			activeSubTab === "batch" ? iosSnippets.mpBatch : iosSnippets.swift;
	} else {
		subTabs = [
			{ id: "primary", label: "cURL Hit" },
			{ id: "node", label: "Node.js Fetch" },
		];
		currentSnippet =
			activeSubTab === "node" ? serverSnippets.node : serverSnippets.curl;
	}

	const handleCopy = async () => {
		await navigator.clipboard.writeText(currentSnippet);
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	};

	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-base font-semibold text-gray-900">
					2. Install {config.platformType.toUpperCase()} Tracking Code
				</h4>
				<p className="text-xs text-gray-500">
					Copy the tracking code into your{" "}
					{config.platformType === "web"
						? "website <head>"
						: config.platformType === "android"
							? "Android project"
							: config.platformType === "ios"
								? "iOS Xcode project"
								: "backend service"}
					.
				</p>
			</div>

			<div className="flex border-b border-gray-200">
				{subTabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveSubTab(tab.id)}
						className={`border-b-2 px-3 py-1.5 text-xs font-semibold ${
							activeSubTab === tab.id ||
							(
								tab.id === "primary" &&
									!subTabs.some((t) => t.id === activeSubTab)
							)
								? "border-blue-600 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className="relative rounded-lg border border-gray-800 bg-gray-900 p-3 font-mono text-xs text-gray-200">
				<button
					type="button"
					onClick={handleCopy}
					className="absolute right-3 top-3 rounded-md bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-500"
				>
					{copied ? "✓ Copied!" : "📋 Copy Code"}
				</button>
				<pre className="overflow-x-auto pr-24 leading-relaxed max-h-56">
					<code>{currentSnippet}</code>
				</pre>
			</div>

			<div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900">
				<strong className="font-semibold">⚡ Direct Ingestion:</strong> Hits
				route directly through your first-party gateway to the Rust Axum engine
				and SeaORM multi-database layer.
			</div>
		</div>
	);
}
