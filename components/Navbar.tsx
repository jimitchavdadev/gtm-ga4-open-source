"use client";

interface NavbarProps {
	platform: "GTM" | "GA4";
	onPlatformChange: (p: "GTM" | "GA4") => void;
	containerId: string;
	propertyId: string;
	previewActive: boolean;
	onTogglePreview: () => void;
	onOpenPublish: () => void;
}

export function Navbar({
	platform,
	onPlatformChange,
	containerId,
	propertyId,
	previewActive,
	onTogglePreview,
	onOpenPublish,
}: NavbarProps) {
	return (
		<header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-5 shadow-xs">
			<div className="flex items-center gap-5">
				<div className="flex items-center gap-2 text-base font-bold text-gray-900">
					<span className="text-xl text-blue-600">⚡</span>
					<span>Analytics Platform</span>
				</div>

				<div className="flex rounded-full border border-blue-200 bg-blue-50 p-1">
					<button
						type="button"
						onClick={() => onPlatformChange("GTM")}
						className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
							platform === "GTM"
								? "bg-blue-600 text-white shadow-xs"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						Tag Manager
					</button>
					<button
						type="button"
						onClick={() => onPlatformChange("GA4")}
						className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
							platform === "GA4"
								? "bg-blue-600 text-white shadow-xs"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						Analytics (GA4)
					</button>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<div className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-600">
					{platform === "GTM" ? (
						<>
							Container: <strong className="text-gray-900">{containerId}</strong>
						</>
					) : (
						<>
							Property: <strong className="text-gray-900">{propertyId}</strong>
						</>
					)}
				</div>

				{platform === "GTM" ? (
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onTogglePreview}
							className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
								previewActive
									? "border-blue-600 bg-blue-50 text-blue-700"
									: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
							}`}
						>
							<span>🔍</span>
							{previewActive ? "Stop Preview" : "Preview"}
						</button>
						<button
							type="button"
							onClick={onOpenPublish}
							className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
						>
							Submit
						</button>
					</div>
				) : (
					<div className="flex items-center gap-2 text-xs font-medium text-gray-700">
						<span className="pulse-circle" />
						<span>Live Ingestion</span>
					</div>
				)}
			</div>
		</header>
	);
}
