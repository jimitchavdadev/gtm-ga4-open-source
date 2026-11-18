"use client";

import { useState } from "react";

export function UserExplorerForm() {
	const [selectedUser, setSelectedUser] = useState("usr_9981a2");

	const users = [
		{
			id: "usr_9981a2",
			cid: "192837461.168",
			sessions: 4,
			events: 28,
			rev: "$249.00",
			lastSeen: "2 mins ago",
		},
		{
			id: "usr_4431b8",
			cid: "983726152.169",
			sessions: 2,
			events: 14,
			rev: "$89.50",
			lastSeen: "14 mins ago",
		},
		{
			id: "usr_1029c4",
			cid: "564738291.170",
			sessions: 6,
			events: 42,
			rev: "$490.00",
			lastSeen: "1 hr ago",
		},
	];

	const stream = [
		{
			id: "ev_1",
			time: "15:42:10",
			event: "purchase",
			params: "value: 149.50, currency: USD, items: [Pro Cloud]",
			isKey: true,
		},
		{
			id: "ev_2",
			time: "15:40:02",
			event: "begin_checkout",
			params: "coupon: WELCOME10",
			isKey: false,
		},
		{
			id: "ev_3",
			time: "15:38:22",
			event: "add_to_cart",
			params: "item_id: prod_01",
			isKey: false,
		},
		{
			id: "ev_4",
			time: "15:35:10",
			event: "view_item",
			params: "item_name: Open Source Analytics Pro",
			isKey: false,
		},
		{
			id: "ev_5",
			time: "15:32:00",
			event: "page_view",
			params: "page_location: /pricing",
			isKey: false,
		},
	];

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
			<div className="border-b border-gray-100 pb-4">
				<h3 className="text-base font-bold text-gray-900">User Explorer</h3>
				<p className="mt-0.5 text-xs text-gray-500">
					Inspect individual pseudonymous user histories and chronological event
					streams
				</p>
			</div>

			<div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* User list */}
				<div className="space-y-2 border-r border-gray-100 pr-4">
					<span className="text-xs font-bold uppercase text-gray-500">
						Select User Profile
					</span>
					{users.map((u) => (
						<button
							key={u.id}
							type="button"
							onClick={() => setSelectedUser(u.id)}
							className={`w-full rounded-lg p-3 text-left transition ${
								selectedUser === u.id
									? "bg-blue-50 border border-blue-200"
									: "bg-gray-50 hover:bg-gray-100"
							}`}
						>
							<div className="flex items-center justify-between">
								<span className="font-mono text-xs font-bold text-blue-700">
									{u.id}
								</span>
								<span className="font-bold text-xs text-emerald-700">
									{u.rev}
								</span>
							</div>
							<div className="mt-1 text-xs text-gray-500">
								{u.sessions} sessions · {u.events} events
							</div>
						</button>
					))}
				</div>

				{/* Event timeline */}
				<div className="lg:col-span-2">
					<div className="flex items-center justify-between pb-2">
						<span className="text-xs font-bold uppercase text-gray-500">
							Chronological Event Stream for {selectedUser}
						</span>
						<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
							Converted User
						</span>
					</div>
					<div className="mt-2 space-y-2">
						{stream.map((s) => (
							<div
								key={s.id}
								className="flex items-start gap-3 rounded-lg border border-gray-100 p-2.5 text-xs bg-gray-50/50"
							>
								<span className="font-mono text-gray-400">{s.time}</span>
								<span
									className={`font-semibold ${s.isKey ? "text-emerald-700" : "text-gray-900"}`}
								>
									{s.event}
								</span>
								<span className="font-mono text-gray-500 truncate flex-1">
									{s.params}
								</span>
								{s.isKey && (
									<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
										Key Event
									</span>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
