"use client";

export function SegmentOverlapForm() {
	const intersections = [
		{ label: "Mobile Traffic Only", count: "3,450 users", pct: "37.5%" },
		{ label: "Purchasers Only", count: "1,220 users", pct: "13.3%" },
		{ label: "Organic Search Only", count: "2,150 users", pct: "23.4%" },
		{ label: "Mobile ∩ Purchasers", count: "780 users", pct: "8.5%" },
		{ label: "Mobile ∩ Organic Search", count: "1,120 users", pct: "12.2%" },
		{
			label: "All 3 Segments Overlap (Mobile + Organic + Purchasers)",
			count: "480 users",
			pct: "5.1%",
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div>
					<h3 className="text-base font-bold text-gray-900">
						Segment Overlap (Venn Exploration)
					</h3>
					<p className="mt-0.5 text-xs text-gray-500">
						Cross-segment intersections comparing multiple audience cohorts
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
						Segment 1: Mobile
					</span>
					<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
						Segment 2: Purchasers
					</span>
					<span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
						Segment 3: Organic
					</span>
				</div>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{intersections.map((item) => (
					<div
						key={item.label}
						className="rounded-lg border border-gray-200 bg-gray-50/60 p-4"
					>
						<div className="text-xs font-bold text-gray-800">{item.label}</div>
						<div className="mt-2 text-2xl font-extrabold text-blue-600">
							{item.count}
						</div>
						<div className="mt-1 text-xs text-gray-500">
							{item.pct} of total analyzed users
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
