"use client";

import type { OnboardingConfig } from "./types";

interface Step1Props {
	config: OnboardingConfig;
	onChange: (updated: Partial<OnboardingConfig>) => void;
}

export function OnboardingStep1Setup({ config, onChange }: Step1Props) {
	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-base font-semibold text-gray-900">
					1. Container & Data Stream Identity
				</h4>
				<p className="text-xs text-gray-500">
					Define your Tag Manager container identifier and primary GA4 web
					stream to route hits to your database.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="ob-container-id"
						className="block text-xs font-semibold uppercase text-gray-700"
					>
						GTM Container ID
					</label>
					<input
						id="ob-container-id"
						type="text"
						value={config.containerId}
						onChange={(e) => onChange({ containerId: e.target.value })}
						placeholder="e.g. GTM-OPENSOURCE"
						className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 focus:border-blue-500 focus:outline-hidden"
					/>
					<p className="mt-1 text-[11px] text-gray-400">
						Client runtime loads tags registered to this container.
					</p>
				</div>

				<div>
					<label
						htmlFor="ob-measurement-id"
						className="block text-xs font-semibold uppercase text-gray-700"
					>
						GA4 Measurement ID
					</label>
					<input
						id="ob-measurement-id"
						type="text"
						value={config.measurementId}
						onChange={(e) => onChange({ measurementId: e.target.value })}
						placeholder="e.g. G-TESTSTREAM"
						className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-blue-600 focus:border-blue-500 focus:outline-hidden"
					/>
					<p className="mt-1 text-[11px] text-gray-400">
						Identifier for routing events to your GA4 property stream.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="ob-stream-name"
						className="block text-xs font-semibold uppercase text-gray-700"
					>
						Data Stream Name
					</label>
					<input
						id="ob-stream-name"
						type="text"
						value={config.streamName}
						onChange={(e) => onChange({ streamName: e.target.value })}
						placeholder="e.g. Production Web Store"
						className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
					/>
				</div>

				<div>
					<label
						htmlFor="ob-stream-url"
						className="block text-xs font-semibold uppercase text-gray-700"
					>
						Website URL
					</label>
					<input
						id="ob-stream-url"
						type="url"
						value={config.streamUrl}
						onChange={(e) => onChange({ streamUrl: e.target.value })}
						placeholder="https://example.com"
						className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
					/>
				</div>
			</div>

			<div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900">
				<strong className="font-semibold">💡 Automatic Compatibility:</strong>{" "}
				Both standard Google format identifiers (e.g.{" "}
				<code className="rounded bg-blue-100 px-1">GTM-XXXX</code> /{" "}
				<code className="rounded bg-blue-100 px-1">G-XXXX</code>) and custom
				strings are supported interchangeably.
			</div>
		</div>
	);
}
