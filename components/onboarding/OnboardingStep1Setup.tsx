"use client";

import type { OnboardingConfig, PlatformType } from "./types";

interface Step1Props {
	config: OnboardingConfig;
	onChange: (updated: Partial<OnboardingConfig>) => void;
}

export function OnboardingStep1Setup({ config, onChange }: Step1Props) {
	const platforms: { id: PlatformType; label: string; icon: string }[] = [
		{ id: "web", label: "Web", icon: "🌐" },
		{ id: "android", label: "Android", icon: "🤖" },
		{ id: "ios", label: "iOS", icon: "🍎" },
		{ id: "server", label: "Server", icon: "⚙️" },
	];

	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-base font-semibold text-gray-900">
					1. Platform & Data Stream Identity
				</h4>
				<p className="text-xs text-gray-500">
					Select your application target platform and define container
					identifiers.
				</p>
			</div>

			{/* Platform Selector */}
			<div>
				<div className="block text-xs font-semibold uppercase text-gray-700 mb-1.5">
					Target Platform
				</div>
				<div className="grid grid-cols-4 gap-2">
					{platforms.map((p) => (
						<button
							key={p.id}
							type="button"
							onClick={() => onChange({ platformType: p.id })}
							className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition ${
								config.platformType === p.id
									? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
									: "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
							}`}
						>
							<span>{p.icon}</span>
							<span>{p.label}</span>
						</button>
					))}
				</div>
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
						placeholder="e.g. Production Mobile App"
						className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
					/>
				</div>

				<div>
					{config.platformType === "web" && (
						<>
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
						</>
					)}

					{config.platformType === "android" && (
						<>
							<label
								htmlFor="ob-pkg-name"
								className="block text-xs font-semibold uppercase text-gray-700"
							>
								Android Package Name
							</label>
							<input
								id="ob-pkg-name"
								type="text"
								value={config.appPackageName}
								onChange={(e) => onChange({ appPackageName: e.target.value })}
								placeholder="com.example.analyticsapp"
								className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 focus:border-blue-500 focus:outline-hidden"
							/>
						</>
					)}

					{config.platformType === "ios" && (
						<>
							<label
								htmlFor="ob-bundle-id"
								className="block text-xs font-semibold uppercase text-gray-700"
							>
								iOS Bundle Identifier
							</label>
							<input
								id="ob-bundle-id"
								type="text"
								value={config.bundleId}
								onChange={(e) => onChange({ bundleId: e.target.value })}
								placeholder="com.example.analyticsapp"
								className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 focus:border-blue-500 focus:outline-hidden"
							/>
						</>
					)}

					{config.platformType === "server" && (
						<>
							<label
								htmlFor="ob-srv-env"
								className="block text-xs font-semibold uppercase text-gray-700"
							>
								Server Environment
							</label>
							<input
								id="ob-srv-env"
								type="text"
								value={config.streamUrl}
								onChange={(e) => onChange({ streamUrl: e.target.value })}
								placeholder="e.g. backend-production-node"
								className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
							/>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
