"use client";

import { useState } from "react";

interface RealtimeTabProps {
	realtimeData: any;
	containerId: string;
	onSendTestHit: () => Promise<void>;
}

export function RealtimeTab({
	realtimeData,
	containerId,
	onSendTestHit,
}: RealtimeTabProps) {
	const [sending, setSending] = useState(false);
	const events = realtimeData?.events || [];
	const activeUsers = realtimeData?.activeUsersLast30Min || 1;

	const handleTestHit = async () => {
		setSending(true);
		await onSendTestHit();
		setSending(false);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2">
						<span className="pulse-circle" />
						<h2 className="text-xl font-bold text-gray-900">
							Realtime Overview
						</h2>
					</div>
					<p className="mt-1 text-sm text-gray-500">
						Activity on container{" "}
						<strong className="font-mono text-gray-700">{containerId}</strong>{" "}
						in the last 30 minutes
					</p>
				</div>
				<button
					type="button"
					disabled={sending}
					onClick={handleTestHit}
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
				>
					{sending ? "Sending..." : "+ Send Test Wire Hit (/g/collect)"}
				</button>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Active Users */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-xs">
					<div className="text-6xl font-extrabold text-blue-600">
						{activeUsers}
					</div>
					<div className="mt-2 text-sm font-semibold text-gray-700">
						Users in last 30 minutes
					</div>
					<div className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-500">
						Platform:{" "}
						<strong className="text-gray-900">100% Desktop (Chrome/Bun)</strong>
					</div>
				</div>

				{/* Geo breakdown */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-2">
					<h3 className="text-base font-bold text-gray-900">
						Top Countries (Realtime)
					</h3>
					<div className="mt-4 space-y-3">
						<div className="flex items-center gap-3">
							<div className="w-32 text-xs font-semibold text-gray-700">
								United States
							</div>
							<div className="h-5 flex-1 overflow-hidden rounded-md bg-gray-100">
								<div className="h-full w-[70%] rounded-md bg-blue-600" />
							</div>
							<div className="w-12 text-right text-xs font-bold text-gray-900">
								70%
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-32 text-xs font-semibold text-gray-700">
								Germany
							</div>
							<div className="h-5 flex-1 overflow-hidden rounded-md bg-gray-100">
								<div className="h-full w-[20%] rounded-md bg-blue-600" />
							</div>
							<div className="w-12 text-right text-xs font-bold text-gray-900">
								20%
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-32 text-xs font-semibold text-gray-700">
								United Kingdom
							</div>
							<div className="h-5 flex-1 overflow-hidden rounded-md bg-gray-100">
								<div className="h-full w-[10%] rounded-md bg-blue-600" />
							</div>
							<div className="w-12 text-right text-xs font-bold text-gray-900">
								10%
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Event stream table */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
				<div className="flex items-center justify-between border-b border-gray-100 pb-4">
					<h3 className="text-base font-bold text-gray-900">
						Recent Event Stream
					</h3>
					<span className="text-xs text-gray-500">
						{events.length} events logged
					</span>
				</div>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
							<tr>
								<th className="px-4 py-3">Time</th>
								<th className="px-4 py-3">Event Name</th>
								<th className="px-4 py-3">Client ID</th>
								<th className="px-4 py-3">Parameters</th>
								<th className="px-4 py-3">Conversion</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{events.length === 0 ? (
								<tr>
									<td colSpan={5} className="py-6 text-center text-gray-400">
										No events logged yet. Click "+ Send Test Wire Hit" above!
									</td>
								</tr>
							) : (
								events.slice(0, 8).map((ev: any) => {
									const timeStr = new Date(
										Math.floor(ev.timestamp_micros / 1000),
									).toLocaleTimeString();
									return (
										<tr key={ev.id} className="hover:bg-gray-50">
											<td className="px-4 py-3 font-mono text-xs text-gray-500">
												{timeStr}
											</td>
											<td className="px-4 py-3 font-semibold text-gray-900">
												{ev.event_name}
											</td>
											<td className="px-4 py-3 font-mono text-xs text-gray-700">
												{ev.client_id}
											</td>
											<td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-gray-500">
												{ev.event_params_json}
											</td>
											<td className="px-4 py-3">
												{ev.is_conversion ? (
													<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
														Key Event
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
