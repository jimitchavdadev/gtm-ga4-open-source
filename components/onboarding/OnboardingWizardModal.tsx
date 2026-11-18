"use client";

import { useState } from "react";
import { OnboardingStep1Setup } from "./OnboardingStep1Setup";
import { OnboardingStep2Snippet } from "./OnboardingStep2Snippet";
import { OnboardingStep3Consent } from "./OnboardingStep3Consent";
import { OnboardingStep4Verify } from "./OnboardingStep4Verify";
import type { OnboardingConfig } from "./types";

interface WizardProps {
	isOpen: boolean;
	onClose: () => void;
	onSendTestHit: () => Promise<void>;
	initialContainerId?: string;
	initialPropertyId?: string;
}

export function OnboardingWizardModal({
	isOpen,
	onClose,
	onSendTestHit,
	initialContainerId = "GTM-OPENSOURCE",
	initialPropertyId = "prop_1",
}: WizardProps) {
	const [step, setStep] = useState(1);
	const [config, setConfig] = useState<OnboardingConfig>({
		containerId: initialContainerId,
		propertyId: initialPropertyId,
		measurementId: "G-TESTSTREAM",
		streamName: "Production Store & App",
		streamUrl: "https://example.com",
		platformType: "web",
		appPackageName: "com.example.analyticsapp",
		bundleId: "com.example.analyticsapp",
		appVersion: "1.0.0",
		analyticsStorage: "granted",
		adStorage: "granted",
		adUserData: "granted",
		adPersonalization: "granted",
		reportingIdentity: "blended",
	});

	if (!isOpen) return null;

	const handleConfigUpdate = (updated: Partial<OnboardingConfig>) => {
		setConfig((prev) => ({ ...prev, ...updated }));
	};

	const handleComplete = () => {
		try {
			localStorage.setItem("gtm_ga4_onboarding_completed", "true");
		} catch {
			// Ignore in non-browser env
		}
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
			<div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
					<div className="flex items-center gap-2">
						<span className="text-xl text-blue-600">⚡</span>
						<h3 className="text-lg font-bold text-gray-900">
							Platform Onboarding & Setup Wizard
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 font-bold text-lg"
					>
						✕
					</button>
				</div>

				{/* Stepper Progress */}
				<div className="flex border-b border-gray-100 bg-gray-50/70 px-6 py-2.5">
					{[
						{ num: 1, title: "1. Setup" },
						{ num: 2, title: "2. Install Snippet" },
						{ num: 3, title: "3. Consent" },
						{ num: 4, title: "4. Verify" },
					].map((s) => (
						<button
							key={s.num}
							type="button"
							onClick={() => setStep(s.num)}
							className={`flex-1 text-center text-xs font-semibold py-1 border-b-2 transition ${
								step === s.num
									? "border-blue-600 text-blue-600"
									: step > s.num
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-400 hover:text-gray-600"
							}`}
						>
							{step > s.num ? `✓ ${s.title.slice(3)}` : s.title}
						</button>
					))}
				</div>

				{/* Step Content */}
				<div className="flex-1 overflow-y-auto px-6 py-5">
					{step === 1 && (
						<OnboardingStep1Setup
							config={config}
							onChange={handleConfigUpdate}
						/>
					)}
					{step === 2 && <OnboardingStep2Snippet config={config} />}
					{step === 3 && (
						<OnboardingStep3Consent
							config={config}
							onChange={handleConfigUpdate}
						/>
					)}
					{step === 4 && (
						<OnboardingStep4Verify
							config={config}
							onSendTestHit={onSendTestHit}
							onComplete={handleComplete}
						/>
					)}
				</div>

				{/* Footer Controls */}
				<div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3.5">
					<button
						type="button"
						disabled={step === 1}
						onClick={() => setStep((s) => Math.max(1, s - 1))}
						className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
					>
						← Back
					</button>

					<div className="text-xs text-gray-400">Step {step} of 4</div>

					{step < 4 ? (
						<button
							type="button"
							onClick={() => setStep((s) => Math.min(4, s + 1))}
							className="rounded-lg bg-blue-600 px-5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
						>
							Next →
						</button>
					) : (
						<button
							type="button"
							onClick={handleComplete}
							className="rounded-lg bg-emerald-600 px-5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
						>
							Done
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
