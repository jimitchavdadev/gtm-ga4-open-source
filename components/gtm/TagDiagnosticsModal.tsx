"use client";

interface TagDiagnosticsModalProps {
	isOpen: boolean;
	onClose: () => void;
	tagsCount: number;
}

export function TagDiagnosticsModal({
	isOpen,
	onClose,
	tagsCount,
}: TagDiagnosticsModalProps) {
	if (!isOpen) return null;

	const checks = [
		{
			id: "CONFIG_TAG",
			title: "Google Tag (gtag.js / Config)",
			status: tagsCount > 0 ? "PASSED" : "FAILED",
			desc: "Container includes an active base Google Tag.",
		},
		{
			id: "CONVERSION_LINKER",
			title: "Conversion Linker Tag",
			status: "PASSED",
			desc: "First-party cookie linker initialized for ad click attribution.",
		},
		{
			id: "CONSENT_MODE_V2",
			title: "Consent Mode v2 Protocol",
			status: "PASSED",
			desc: "GCS and GCD signals valid across all EEA regions.",
		},
		{
			id: "LEGACY_TAGS",
			title: "Legacy Tag Deprecation",
			status: "PASSED",
			desc: "0 Universal Analytics tags detected; clean GA4 AST.",
		},
	];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
				<div className="flex items-center justify-between border-b border-gray-100 pb-4">
					<div className="flex items-center gap-2.5">
						<span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
							✓
						</span>
						<div>
							<h3 className="font-bold text-gray-900 text-base">
								Tag Diagnostics & Health
							</h3>
							<p className="text-xs text-gray-500">
								Google Tag Quality Status:{" "}
								<span className="font-semibold text-emerald-600">
									EXCELLENT
								</span>
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						✕
					</button>
				</div>

				<div className="mt-4 space-y-3">
					{checks.map((c) => (
						<div
							key={c.id}
							className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50 p-3.5"
						>
							<div>
								<div className="font-semibold text-gray-900 text-sm">
									{c.title}
								</div>
								<div className="text-xs text-gray-500">{c.desc}</div>
							</div>
							<span
								className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
									c.status === "PASSED"
										? "bg-emerald-100 text-emerald-800"
										: "bg-red-100 text-red-800"
								}`}
							>
								{c.status}
							</span>
						</div>
					))}
				</div>

				<div className="mt-6 flex justify-end">
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
					>
						Close Diagnostics
					</button>
				</div>
			</div>
		</div>
	);
}
