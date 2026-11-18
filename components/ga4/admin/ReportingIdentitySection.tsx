"use client";

import { useState } from "react";

type IdentityMode = "BLENDED" | "OBSERVED" | "DEVICE_BASED";

export function ReportingIdentitySection() {
	const [mode, setMode] = useState<IdentityMode>("BLENDED");

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div>
					<div className="flex items-center gap-2">
						<h3 className="text-base font-bold text-gray-900">
							Reporting Identity
						</h3>
						<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
							Consent Mode v2 Aware
						</span>
					</div>
					<p className="mt-1 text-xs text-gray-500">
						Determines how user and conversion data is stitched across devices
						and cookieless pings
					</p>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				{/* Blended */}
				<button
					type="button"
					onClick={() => setMode("BLENDED")}
					className={`rounded-xl border p-4 text-left transition ${
						mode === "BLENDED"
							? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
							: "border-gray-200 bg-white hover:border-gray-300"
					}`}
				>
					<div className="flex items-center justify-between">
						<span className="text-sm font-bold text-gray-900">Blended</span>
						<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
							Recommended
						</span>
					</div>
					<div className="mt-2 text-xs text-gray-600">
						User-ID &rarr; Google Signals &rarr; Device ID &rarr;{" "}
						<strong>Behavioral Modeling</strong>
					</div>
					<p className="mt-3 text-xs text-gray-500">
						Uses machine learning to recover unconsented user interactions from
						cookieless pings (+18.4% modeled lift).
					</p>
				</button>

				{/* Observed */}
				<button
					type="button"
					onClick={() => setMode("OBSERVED")}
					className={`rounded-xl border p-4 text-left transition ${
						mode === "OBSERVED"
							? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
							: "border-gray-200 bg-white hover:border-gray-300"
					}`}
				>
					<span className="text-sm font-bold text-gray-900">Observed</span>
					<div className="mt-2 text-xs text-gray-600">
						User-ID &rarr; Google Signals &rarr; Device ID
					</div>
					<p className="mt-3 text-xs text-gray-500">
						Strictly uses observed data points. Excludes unconsented cookieless
						pings from user stitch counts.
					</p>
				</button>

				{/* Device-Based */}
				<button
					type="button"
					onClick={() => setMode("DEVICE_BASED")}
					className={`rounded-xl border p-4 text-left transition ${
						mode === "DEVICE_BASED"
							? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
							: "border-gray-200 bg-white hover:border-gray-300"
					}`}
				>
					<span className="text-sm font-bold text-gray-900">Device-Based</span>
					<div className="mt-2 text-xs text-gray-600">
						Device ID (Client ID / FPID) only
					</div>
					<p className="mt-3 text-xs text-gray-500">
						Legacy cookie-only model. Completely ignores User-ID and behavioral
						modeling.
					</p>
				</button>
			</div>

			{mode === "BLENDED" && (
				<div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
					✓ <strong>Behavioral Modeling Active:</strong> Processing cookieless
					pings with Advanced Consent Mode v2 signals (
					<code className="font-mono">gcs=G100, gcd=1pqpq5</code>). Modeled lift
					is factored into active users and conversion attribution.
				</div>
			)}
		</div>
	);
}
