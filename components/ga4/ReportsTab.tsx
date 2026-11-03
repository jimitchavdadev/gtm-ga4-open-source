"use client";

import { useState } from "react";

export function ReportsTab() {
	const [activeSubTab, setActiveSubTab] = useState<
		"ACQUISITION" | "ENGAGEMENT" | "MONETIZATION" | "TECH"
	>("ACQUISITION");

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">Life Cycle & User Reports</h2>
					<p className="mt-1 text-sm text-gray-500">
						Explore how users discover and interact with your site or application
					</p>
				</div>
				<div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
					{[
						{ id: "ACQUISITION", label: "Traffic Acquisition" },
						{ id: "ENGAGEMENT", label: "Engagement" },
						{ id: "MONETIZATION", label: "Monetization" },
						{ id: "TECH", label: "Tech & Devices" },
					].map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveSubTab(tab.id as any)}
							className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
								activeSubTab === tab.id
									? "bg-white text-blue-600 shadow-xs"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{activeSubTab === "ACQUISITION" && (
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
					<h3 className="text-base font-bold text-gray-900">
						Traffic Acquisition by Session Default Channel Group
					</h3>
					<div className="mt-4 overflow-x-auto">
						<table className="w-full text-left text-sm text-gray-600">
							<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
								<tr>
									<th className="px-4 py-3">Channel Group</th>
									<th className="px-4 py-3">Users</th>
									<th className="px-4 py-3">Sessions</th>
									<th className="px-4 py-3">Engaged Sessions</th>
									<th className="px-4 py-3">Engagement Rate</th>
									<th className="px-4 py-3">Conversions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{[
									{ channel: "Organic Search", users: 412, sessions: 520, engaged: 390, rate: "75.0%", conv: 18 },
									{ channel: "Direct", users: 280, sessions: 310, engaged: 215, rate: "69.4%", conv: 12 },
									{ channel: "Paid Search (Google Ads)", users: 195, sessions: 240, engaged: 185, rate: "77.1%", conv: 24 },
									{ channel: "Email Marketing", users: 110, sessions: 145, engaged: 120, rate: "82.8%", conv: 15 },
									{ channel: "Referral", users: 65, sessions: 78, engaged: 52, rate: "66.7%", conv: 4 },
								].map((row) => (
									<tr key={row.channel} className="hover:bg-gray-50">
										<td className="px-4 py-3 font-semibold text-gray-900">{row.channel}</td>
										<td className="px-4 py-3">{row.users}</td>
										<td className="px-4 py-3">{row.sessions}</td>
										<td className="px-4 py-3">{row.engaged}</td>
										<td className="px-4 py-3 font-medium text-emerald-600">{row.rate}</td>
										<td className="px-4 py-3 font-bold text-gray-900">{row.conv}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeSubTab === "ENGAGEMENT" && (
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
					<h3 className="text-base font-bold text-gray-900">Events & Conversions</h3>
					<div className="mt-4 overflow-x-auto">
						<table className="w-full text-left text-sm text-gray-600">
							<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
								<tr>
									<th className="px-4 py-3">Event Name</th>
									<th className="px-4 py-3">Event Count</th>
									<th className="px-4 py-3">Total Users</th>
									<th className="px-4 py-3">Per User</th>
									<th className="px-4 py-3">Key Event</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{[
									{ name: "page_view", count: "1,420", users: 650, perUser: 2.18, isKey: false },
									{ name: "session_start", count: "890", users: 650, perUser: 1.37, isKey: false },
									{ name: "view_item", count: "410", users: 280, perUser: 1.46, isKey: false },
									{ name: "add_to_cart", count: "185", users: 140, perUser: 1.32, isKey: false },
									{ name: "purchase", count: "73", users: 68, perUser: 1.07, isKey: true },
								].map((row) => (
									<tr key={row.name} className="hover:bg-gray-50">
										<td className="px-4 py-3 font-semibold text-gray-900">{row.name}</td>
										<td className="px-4 py-3 font-mono">{row.count}</td>
										<td className="px-4 py-3">{row.users}</td>
										<td className="px-4 py-3">{row.perUser}</td>
										<td className="px-4 py-3">
											{row.isKey ? (
												<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
													Key Event
												</span>
											) : (
												<span className="text-gray-400">No</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeSubTab === "MONETIZATION" && (
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
					<h3 className="text-base font-bold text-gray-900">Ecommerce Purchases & Items Revenue</h3>
					<div className="mt-4 overflow-x-auto">
						<table className="w-full text-left text-sm text-gray-600">
							<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
								<tr>
									<th className="px-4 py-3">Item Name</th>
									<th className="px-4 py-3">Views</th>
									<th className="px-4 py-3">Cart Adds</th>
									<th className="px-4 py-3">Cart-to-View</th>
									<th className="px-4 py-3">Purchases</th>
									<th className="px-4 py-3">Revenue</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{[
									{ name: "Pro Analytics Cloud", views: 340, cart: 95, rate: "27.9%", purch: 42, rev: "$4,158.00" },
									{ name: "Enterprise Self-Hosted License", views: 180, cart: 45, rate: "25.0%", purch: 21, rev: "$10,479.00" },
									{ name: "Developer Support Plan", views: 120, cart: 32, rate: "26.7%", purch: 10, rev: "$990.00" },
								].map((row) => (
									<tr key={row.name} className="hover:bg-gray-50">
										<td className="px-4 py-3 font-semibold text-gray-900">{row.name}</td>
										<td className="px-4 py-3">{row.views}</td>
										<td className="px-4 py-3">{row.cart}</td>
										<td className="px-4 py-3 font-medium text-blue-600">{row.rate}</td>
										<td className="px-4 py-3 font-bold text-gray-900">{row.purch}</td>
										<td className="px-4 py-3 font-semibold text-emerald-600">{row.rev}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeSubTab === "TECH" && (
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
					<h3 className="text-base font-bold text-gray-900">Users by Device Category</h3>
					<div className="mt-4 overflow-x-auto">
						<table className="w-full text-left text-sm text-gray-600">
							<thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
								<tr>
									<th className="px-4 py-3">Device Category</th>
									<th className="px-4 py-3">Operating Systems</th>
									<th className="px-4 py-3">Active Users</th>
									<th className="px-4 py-3">Engagement Rate</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{[
									{ device: "Desktop", os: "Linux, macOS, Windows", users: 580, rate: "78.2%" },
									{ device: "Mobile", os: "Android, iOS", users: 260, rate: "65.4%" },
									{ device: "Tablet", os: "iPadOS, Android Tablet", users: 50, rate: "62.0%" },
								].map((row) => (
									<tr key={row.device} className="hover:bg-gray-50">
										<td className="px-4 py-3 font-semibold text-gray-900">{row.device}</td>
										<td className="px-4 py-3 text-xs text-gray-500">{row.os}</td>
										<td className="px-4 py-3 font-bold text-gray-900">{row.users}</td>
										<td className="px-4 py-3 font-medium text-emerald-600">{row.rate}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
