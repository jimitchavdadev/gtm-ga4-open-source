"use client";

import { useState } from "react";

interface PreviewTabProps {
	containerId: string;
	onPushEvent: (eventData: any) => void;
}

export function PreviewTab({ containerId, onPushEvent }: PreviewTabProps) {
	const [selectedIdx, setSelectedIdx] = useState(2);
	const [events, setEvents] = useState([
		{ id: 1, name: "Consent (default)", time: "0.00s", type: "consent" },
		{ id: 2, name: "Initialization (gtm.init)", time: "0.02s", type: "init" },
		{
			id: 3,
			name: "Container Loaded (gtm.js)",
			time: "0.05s",
			type: "pageview",
		},
		{ id: 4, name: "DOM Ready (gtm.dom)", time: "0.12s", type: "dom" },
		{ id: 5, name: "Window Loaded (gtm.load)", time: "0.25s", type: "window" },
		{ id: 6, name: "purchase", time: "1.42s", type: "custom" },
	]);

	const currentEvent = events[selectedIdx] || events[0];
	const isPurchase = currentEvent?.name === "purchase";

	const handlePushTestEvent = () => {
		const newEv = {
			id: events.length + 1,
			name: "custom_conversion",
			time: "2.10s",
			type: "custom",
		};
		setEvents([...events, newEv]);
		setSelectedIdx(events.length);
		onPushEvent({ event: "custom_conversion", value: 49.99 });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">
						Tag Assistant (Preview & Debug)
					</h2>
					<p className="mt-1 text-sm text-gray-500">
						Connected to container{" "}
						<strong className="font-mono text-gray-800">{containerId}</strong>
					</p>
				</div>
				<button
					type="button"
					onClick={handlePushTestEvent}
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700"
				>
					+ Push Test Event (dataLayer)
				</button>
			</div>

			<div className="flex flex-col gap-6 lg:flex-row">
				{/* Timeline */}
				<div className="w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs lg:w-72">
					<div className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500">
						Event Timeline
					</div>
					<div className="divide-y divide-gray-100">
						{events.map((e, idx) => (
							<button
								key={e.id}
								type="button"
								onClick={() => setSelectedIdx(idx)}
								className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
									selectedIdx === idx
										? "bg-blue-50 font-semibold text-blue-700"
										: "text-gray-700 hover:bg-gray-50"
								}`}
							>
								<span>
									{e.id}. {e.name}
								</span>
								<span className="font-mono text-xs text-gray-400">
									{e.time}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Inspector */}
				<div className="flex-1 space-y-6">
					<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
						<h3 className="text-base font-bold text-gray-900">
							Tags Fired on Event:{" "}
							<span className="text-blue-600">{currentEvent?.name}</span>
						</h3>
						<div className="mt-4">
							{isPurchase || currentEvent?.name.includes("Loaded") ? (
								<div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
									<div className="flex items-center justify-between">
										<strong className="text-sm text-gray-900">
											Google Analytics: GA4 Event Tag
										</strong>
										<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
											Fired 1 time
										</span>
									</div>
									<div className="mt-2 text-xs text-gray-500">
										Firing Trigger:{" "}
										<code className="text-gray-800">
											{isPurchase ? "purchase" : "All Pages"}
										</code>{" "}
										&bull; Priority: <code className="text-gray-800">10</code>
									</div>
								</div>
							) : (
								<p className="text-sm text-gray-400">
									No tags fired on this event.
								</p>
							)}
						</div>
					</div>

					<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
						<h3 className="text-base font-bold text-gray-900">
							Data Layer State
						</h3>
						<pre className="mt-4 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-xs text-emerald-400">
							{isPurchase
								? JSON.stringify(
										{
											event: "purchase",
											ecommerce: {
												transaction_id: "T_98765",
												value: 99.5,
												currency: "USD",
												items: [
													{
														item_name: "Open Source Analytics Pro",
														price: 99.5,
													},
												],
											},
											uniqueEventId: 6,
										},
										null,
										2,
									)
								: JSON.stringify(
										{
											event: currentEvent?.name || "gtm.js",
											"gtm.start": Date.now() - 300,
											page_location: "http://localhost:3000/shop",
											uniqueEventId: currentEvent?.id || 1,
										},
										null,
										2,
									)}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
