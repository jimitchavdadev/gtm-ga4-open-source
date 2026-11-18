import { proxyToRust } from "@/src/server/rust-proxy";

export async function OPTIONS() {
	return proxyToRust(new Request("http://localhost", { method: "OPTIONS" }));
}

export async function POST(req: Request) {
	return proxyToRust(req, "/mp/collect");
}
