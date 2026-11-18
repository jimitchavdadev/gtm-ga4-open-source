"use client";

export function PathExplorationForm() {
	const pathSteps = [
		{
			step: "Step 1: Starting Event",
			nodes: [
				{ name: "session_start", count: "10,240 users (100%)", share: "100%" },
			],
		},
		{
			step: "Step 2: Next Action",
			nodes: [
				{ name: "page_view (/home)", count: "6,820 users", share: "66.6%" },
				{ name: "page_view (/pricing)", count: "2,150 users", share: "21.0%" },
				{ name: "view_promotion", count: "1,270 users", share: "12.4%" },
			],
		},
		{
			step: "Step 3: Intent & Conversion",
			nodes: [
				{ name: "view_item", count: "4,120 users", share: "40.2%" },
				{ name: "add_to_cart", count: "1,850 users", share: "18.1%" },
				{ name: "purchase", count: "730 users", share: "7.1%" },
			],
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<div className="flex items-center justify-between border-b border-gray-100 pb-4">
				<div>
					<h3 className="text-base font-bold text-gray-900">
						Path Exploration (Tree Clickstream)
					</h3>
					<p className="mt-0.5 text-xs text-gray-500">
						Examine forward and reverse journey branchings from key events
					</p>
				</div>
				<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
					Forward Path
				</span>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
				{pathSteps.map((s, idx) => (
					<div key={s.step} className="space-y-3">
						<div className="flex items-center gap-2">
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
								{idx + 1}
							</span>
							<span className="text-xs font-bold text-gray-800">{s.step}</span>
						</div>
						<div className="space-y-2">
							{s.nodes.map((node) => (
								<div
									key={node.name}
									className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
								>
									<div className="font-mono text-xs font-bold text-gray-900">
										{node.name}
									</div>
									<div className="mt-1 flex items-center justify-between text-xs text-gray-500">
										<span>{node.count}</span>
										<span className="font-semibold text-blue-600">
											{node.share}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
