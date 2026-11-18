"use client";

import type { OnboardingConfig } from "./types";

interface Step3Props {
	config: OnboardingConfig;
	onChange: (updated: Partial<OnboardingConfig>) => void;
}

export function OnboardingStep3Consent({ config, onChange }: Step3Props) {
	return (
		<div className="space-y-4">
			<div>
				<h4 className="text-base font-semibold text-gray-900">
					3. Privacy, Consent Mode v2 & Reporting Identity
				</h4>
				<p className="text-xs text-gray-500">
					Configure EU GDPR / ePrivacy default consent behaviors and choose how
					cross-device user identities are stitched.
				</p>
			</div>

			<div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
				<div className="text-xs font-semibold uppercase text-gray-700">
					Default Consent Mode v2 Signals
				</div>
				<p className="mt-0.5 text-xs text-gray-500">
					Default status applied before user accepts or rejects your consent
					banner:
				</p>

				<div className="mt-3 grid grid-cols-2 gap-3">
					{[
						{
							key: "analyticsStorage",
							label: "analytics_storage",
							desc: "Enables cookies for analytics tracking",
						},
						{
							key: "adStorage",
							label: "ad_storage",
							desc: "Enables cookies for advertising",
						},
						{
							key: "adUserData",
							label: "ad_user_data",
							desc: "Sends user data to advertising systems",
						},
						{
							key: "adPersonalization",
							label: "ad_personalization",
							desc: "Enables personalized remarketing",
						},
					].map((item) => {
						const isGranted =
							config[item.key as keyof OnboardingConfig] === "granted";
						return (
							<div
								key={item.key}
								className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5"
							>
								<div>
									<div className="font-mono text-xs font-bold text-gray-900">
										{item.label}
									</div>
									<div className="text-[10px] text-gray-500">{item.desc}</div>
								</div>
								<button
									type="button"
									onClick={() =>
										onChange({
											[item.key]: isGranted ? "denied" : "granted",
										})
									}
									className={`rounded px-2.5 py-1 text-xs font-bold transition ${
										isGranted
											? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
											: "bg-red-100 text-red-800 hover:bg-red-200"
									}`}
								>
									{isGranted ? "GRANTED" : "DENIED"}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			<div>
				<label
					htmlFor="ob-rep-identity"
					className="block text-xs font-semibold uppercase text-gray-700"
				>
					Primary Reporting Identity
				</label>
				<select
					id="ob-rep-identity"
					value={config.reportingIdentity}
					onChange={(e) =>
						onChange({
							reportingIdentity: e.target.value as
								| "blended"
								| "observed"
								| "device",
						})
					}
					className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-hidden"
				>
					<option value="blended">
						Blended (User ID + Device ID + Behavioral Modeling) — Recommended
					</option>
					<option value="observed">Observed (User ID + Device ID)</option>
					<option value="device">Device-Based (Device ID / Cookie only)</option>
				</select>
				<p className="mt-1 text-[11px] text-gray-500">
					Blended identity uses machine learning to bridge gaps when users deny
					analytics cookies.
				</p>
			</div>
		</div>
	);
}
