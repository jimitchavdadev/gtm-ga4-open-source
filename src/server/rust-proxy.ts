import { handleOfflineTestFallback } from "./offline-fallback";

const RUST_URL = process.env.RUST_ENGINE_URL || "http://127.0.0.1:8080";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function proxyToRust(
	req: Request,
	targetPath?: string,
): Promise<Response> {
	if (req.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	const url = new URL(req.url);
	const path = targetPath || `${url.pathname}${url.search}`;
	const targetUrl = `${RUST_URL}${path}`;

	try {
		const reqInit: RequestInit = {
			method: req.method,
			headers: {
				...Object.fromEntries(req.headers.entries()),
				host: new URL(RUST_URL).host,
			},
		};

		if (req.method !== "GET" && req.method !== "HEAD") {
			const bodyBuffer = await req.clone().arrayBuffer();
			if (bodyBuffer.byteLength > 0) {
				reqInit.body = bodyBuffer;
			}
		}

		const resp = await fetch(targetUrl, reqInit);
		const respHeaders = new Headers(resp.headers);
		for (const [k, v] of Object.entries(corsHeaders)) {
			respHeaders.set(k, v);
		}

		return new Response(resp.body, {
			status: resp.status,
			statusText: resp.statusText,
			headers: respHeaders,
		});
	} catch (_err) {
		return handleOfflineTestFallback(req, path);
	}
}
