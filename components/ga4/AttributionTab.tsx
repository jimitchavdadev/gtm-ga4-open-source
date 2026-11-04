"use client";

interface AttributionTabProps {
	attributionData: any;
}

export function AttributionTab({ attributionData }: AttributionTabProps) {
	const models = attributionData?.models || {
		lastClick: { "Organic Search": 40, "Paid Search": 35, Email: 25 },
		markovRemovalEffects: {
			"Paid Search": 0.45,
			"Organic Search": 0.35,
			Email: 0.2,
		},
		shapleyValueDDA: {
			"Paid Search": 0.42,
			"Organic Search": 0.38,
			Email: 0.2,
		},
	};

	const channelRows = [
		{ name: "Paid Search", baseSpend: 10000, lift: "+20.0% assist lift" },
		{ name: "Organic Search", baseSpend: 10000, lift: "-5.0%" },
		{ name: "Email Marketing", baseSpend: 10000, lift: "-20.0%" },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold text-gray-900">
							Attribution Model Comparison
						</h2>
						<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold uppercase text-blue-700">
							DDA Engine
						</span>
					</div>
					<p className="mt-1 text-sm text-gray-500">
						Compare how different algorithmic attribution models distribute
						conversion credit
					</p>
				</div>
				<div className="text-xs text-gray-500">
					Lookback Window:{" "}
					<strong className="text-gray-900">90-Day Conversion Path</strong>
				</div>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">
					Cross-Channel Credit Comparison
				</h3>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Channel Group</th>
								<th className="px-4 py-3">Cross-Channel Last Click</th>
								<th className="px-4 py-3">Markov Chain Removal Effects</th>
								<th className="px-4 py-3">Data-Driven (Shapley Game Theory)</th>
								<th className="px-4 py-3">% Variance (DDA vs Last Click)</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{channelRows.map((row) => {
								const lc = models.lastClick?.[row.name] ?? 0;
								const markov = models.markovRemovalEffects?.[row.name] ?? 0;
								const shapley = models.shapleyValueDDA?.[row.name] ?? 0;
								const lcPct = typeof lc === "number" ? lc.toFixed(1) : lc;
								const markovPct =
									typeof markov === "number"
										? (markov > 1 ? markov : markov * 100).toFixed(1)
										: markov;
								const shapleyPct =
									typeof shapley === "number"
										? (shapley > 1 ? shapley : shapley * 100).toFixed(1)
										: shapley;

								return (
									<tr key={row.name} className="hover:bg-gray-50">
										<td className="px-4 py-3 font-semibold text-gray-900">
											{row.name}
										</td>
										<td className="px-4 py-3">{lcPct}%</td>
										<td className="px-4 py-3 font-bold text-blue-600">
											{markovPct}%
										</td>
										<td className="px-4 py-3 font-bold text-gray-900">
											{shapleyPct}%
										</td>
										<td className="px-4 py-3">
											<span
												className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
													row.lift.startsWith("+")
														? "bg-emerald-50 text-emerald-700"
														: "bg-amber-50 text-amber-700"
												}`}
											>
												{row.lift}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Top Conversion Paths */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<h3 className="text-base font-bold text-gray-900">
					Top Conversion Paths (Multi-Touch)
				</h3>
				<div className="mt-4 space-y-3">
					{[
						{
							rank: 1,
							steps: [
								{ id: "1-ps", channel: "Paid Search" },
								{ id: "1-os", channel: "Organic Search" },
								{ id: "1-em", channel: "Email" },
							],
							conv: "Purchase ($129.50)",
							stats: "32 conversions (43.8%)",
						},
						{
							rank: 2,
							steps: [
								{ id: "2-os", channel: "Organic Search" },
								{ id: "2-dir", channel: "Direct" },
							],
							conv: "Purchase ($99.00)",
							stats: "24 conversions (32.9%)",
						},
						{
							rank: 3,
							steps: [{ id: "3-ps", channel: "Paid Search" }],
							conv: "Purchase ($199.00)",
							stats: "17 conversions (23.3%)",
						},
					].map((item) => (
						<div
							key={item.rank}
							className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-3 text-xs"
						>
							<span className="w-5 font-bold text-gray-500">{item.rank}.</span>
							{item.steps.map((s, idx) => (
								<span key={s.id} className="flex items-center gap-2">
									<span className="rounded-md bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
										{s.channel}
									</span>
									{idx < item.steps.length - 1 && (
										<span className="text-gray-400">&rarr;</span>
									)}
								</span>
							))}
							<span className="rounded-md bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
								{item.conv}
							</span>
							<span className="ml-auto font-semibold text-gray-700">
								{item.stats}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
