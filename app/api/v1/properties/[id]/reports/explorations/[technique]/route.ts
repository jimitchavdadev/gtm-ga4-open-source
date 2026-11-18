import { proxyToRust } from "@/src/server/rust-proxy";

export async function OPTIONS() {
	return proxyToRust(new Request("http://localhost", { method: "OPTIONS" }));
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string; technique: string }> },
) {
	const { id, technique } = await params;
	return proxyToRust(
		req,
		`/api/v1/properties/${id}/reports/explorations/${technique}`,
	);
}
