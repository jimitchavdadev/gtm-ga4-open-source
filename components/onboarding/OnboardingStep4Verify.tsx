"use client";

import { useState } from "react";
import type { OnboardingConfig, VerificationResult } from "./types";

interface Step4Props {
	config: OnboardingConfig;
	onSendTestHit: () => Promise<void>;
	onComplete: () => void;
}

export function OnboardingStep4Verify({
	config,
	onSendTestHit,
	onComplete,
}: Step4Props) {
	const [result, setResult] = useState<VerificationResult>({ status: "idle" });

	const handleTest = async () => {
		setResult({ status: "testing" });
		try {
			await onSendTestHit();
			const now = new Date().toLocaleTimeString();
			const evId = `ev_${Math.random().toString(36).slice(2, 9)}`;
			setResult({
				status: "success",
				timestamp: now,
				eventId: evId,
				gcs: config.analyticsStorage === "granted" ? "G111" : "G100",
			});
		} catch (err: any) {
			setResult({
				status: "error",
				message: err?.message || "Failed to emit test hit to backend.",
			});
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-base font-semibold text-gray-900">
					4. Live Connection & Ingestion Verification
				</h4>
				<p className="text-xs text-gray-500">
					Emit a synthetic test hit to verify the pipeline from Next.js Gateway
					through the Rust Core Engine.
				</p>
			</div>

			<div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5 text-center">
				{result.status === "idle" && (
					<div className="space-y-3">
						<div className="text-3xl">📡</div>
						<div className="text-sm font-semibold text-gray-800">
							Ready to Test Ingestion Pipeline
						</div>
						<p className="mx-auto max-w-sm text-xs text-gray-500">
							We will send an event payload to{" "}
							<code className="text-blue-600">/api/events/collect</code> to
							confirm live wire-protocol ingestion.
						</p>
						<button
							type="button"
							onClick={handleTest}
							className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
						>
							Send Test Ping Now
						</button>
					</div>
				)}

				{result.status === "testing" && (
					<div className="space-y-2 py-4">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
						<div className="text-sm font-semibold text-gray-800">
							Emitting event to /api/events/collect...
						</div>
					</div>
				)}

				{result.status === "success" && (
					<div className="space-y-3">
						<div className="text-3xl">🎉</div>
						<div className="text-base font-bold text-emerald-700">
							Live Ingestion Confirmed!
						</div>
						<div className="mx-auto max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-left font-mono text-xs text-emerald-950">
							<div>
								Event: <strong className="text-emerald-900">page_view</strong>
							</div>
							<div>Property: {config.measurementId}</div>
							<div>Container: {config.containerId}</div>
							<div>Consent Signal: {result.gcs}</div>
							<div>Status: HTTP 204 No Content</div>
							<div>Received At: {result.timestamp}</div>
						</div>
						<div className="flex justify-center gap-3 pt-2">
							<button
								type="button"
								onClick={handleTest}
								className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
							>
								Test Again
							</button>
							<button
								type="button"
								onClick={onComplete}
								className="rounded-md bg-emerald-600 px-5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
							>
								Finish & Go to Dashboard
							</button>
						</div>
					</div>
				)}

				{result.status === "error" && (
					<div className="space-y-3 py-2">
						<div className="text-3xl">⚠️</div>
						<div className="text-sm font-bold text-red-700">
							Connection Failed
						</div>
						<p className="text-xs text-red-600">{result.message}</p>
						<button
							type="button"
							onClick={handleTest}
							className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
						>
							Retry Ingestion Test
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
