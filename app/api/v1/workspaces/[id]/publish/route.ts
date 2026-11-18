import { proxyToRust } from "@/src/server/rust-proxy";

export async function OPTIONS() {
	return proxyToRust(new Request("http://localhost", { method: "OPTIONS" }));
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	return proxyToRust(req, `/api/v1/workspaces/${id}/publish`);
}
