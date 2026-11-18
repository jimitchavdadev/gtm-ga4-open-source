"use client";

import { useState } from "react";

interface CustomTemplateItem {
	id: string;
	name: string;
	type: "TAG" | "VARIABLE";
	sandboxedCode: string;
	permissions: string[];
}

const INITIAL_TEMPLATE: CustomTemplateItem = {
	id: "tmpl_1",
	name: "Facebook CAPI Web Dispatcher",
	type: "TAG",
	sandboxedCode:
		"const sendPixel = require('sendPixel');\nsendPixel('https://graph.facebook.com/v19.0/events', data);",
	permissions: ["send_pixel: graph.facebook.com", "read_data_layer: *"],
};

const DEFAULT_TEMPLATES: CustomTemplateItem[] = [
	INITIAL_TEMPLATE,
	{
		id: "tmpl_2",
		name: "First-Party Cookie Extractor",
		type: "VARIABLE",
		sandboxedCode:
			"const getCookieValues = require('getCookieValues');\nreturn getCookieValues('_fpid')[0] || '';",
		permissions: ["read_cookies: _fpid, _ga"],
	},
];

export function CustomTemplatesTab() {
	const [templates, setTemplates] =
		useState<CustomTemplateItem[]>(DEFAULT_TEMPLATES);
	const [selected, setSelected] =
		useState<CustomTemplateItem>(INITIAL_TEMPLATE);
	const [name, setName] = useState("");
	const [type, setType] = useState<"TAG" | "VARIABLE">("TAG");
	const [code, setCode] = useState(
		"const log = require('logToConsole');\nlog('Sandboxed template running');",
	);

	const handleAdd = () => {
		if (!name.trim()) return;
		const newItem: CustomTemplateItem = {
			id: `tmpl_${Date.now()}`,
			name,
			type,
			sandboxedCode: code,
			permissions: ["access_globals: *", "read_data_layer: *"],
		};
		setTemplates([...templates, newItem]);
		setSelected(newItem);
		setName("");
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">
					Custom Templates & Sandboxed VM
				</h1>
				<p className="mt-1 text-sm text-gray-500">
					Create reusable tags and variables with strict sandboxed security
					permissions.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
					<h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
						Installed Templates ({templates.length})
					</h3>
					<div className="space-y-2">
						{templates.map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => setSelected(t)}
								className={`w-full rounded-lg p-3 text-left transition ${
									selected.id === t.id
										? "border-blue-500 bg-blue-50/50 text-blue-900 border"
										: "border border-gray-100 hover:bg-gray-50"
								}`}
							>
								<div className="flex items-center justify-between">
									<span className="font-medium text-sm">{t.name}</span>
									<span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
										{t.type}
									</span>
								</div>
								<div className="mt-1 text-xs text-gray-500">
									{t.permissions.length} declared permissions
								</div>
							</button>
						))}
					</div>

					<div className="mt-6 border-t border-gray-200 pt-4">
						<h4 className="text-xs font-semibold uppercase text-gray-700">
							Create New Template
						</h4>
						<input
							type="text"
							placeholder="Template Name..."
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-2 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
						/>
						<select
							value={type}
							onChange={(e) => setType(e.target.value as "TAG" | "VARIABLE")}
							className="mt-2 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
						>
							<option value="TAG">Tag Template</option>
							<option value="VARIABLE">Variable Template</option>
						</select>
						<textarea
							rows={3}
							value={code}
							onChange={(e) => setCode(e.target.value)}
							placeholder="Template Code..."
							className="mt-2 w-full rounded-md border border-gray-300 p-2 font-mono text-xs"
						/>
						<button
							type="button"
							onClick={handleAdd}
							className="mt-3 w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
						>
							+ Add Template
						</button>
					</div>
				</div>

				<div className="space-y-6 lg:col-span-2">
					<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
						<div className="flex items-center justify-between border-b border-gray-200 pb-3">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">
									{selected.name}
								</h2>
								<span className="text-xs text-gray-500">ID: {selected.id}</span>
							</div>
							<span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
								{selected.type}
							</span>
						</div>

						<div className="mt-4">
							<label
								htmlFor="sandboxed-code-view"
								className="block text-xs font-semibold uppercase text-gray-500"
							>
								Sandboxed JavaScript Code
							</label>
							<textarea
								id="sandboxed-code-view"
								rows={6}
								value={selected.sandboxedCode}
								readOnly
								className="mt-1 w-full rounded-md border border-gray-200 bg-gray-900 p-3 font-mono text-xs text-green-400"
							/>
						</div>

						<div className="mt-4">
							<h4 className="text-xs font-semibold uppercase text-gray-500">
								Security Permissions Policy
							</h4>
							<ul className="mt-2 space-y-1">
								{selected.permissions.map((p) => (
									<li
										key={p}
										className="flex items-center gap-2 font-mono text-xs text-gray-700"
									>
										<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
										<span>{p}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
