import { generateGtmScript } from "@/src/server/client-template";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return new Response("Missing required id parameter", {
			status: 400,
			headers: { "Access-Control-Allow-Origin": "*" },
		});
	}

	const script = generateGtmScript(id);

	return new Response(script, {
		status: 200,
		headers: {
			"Content-Type": "application/javascript; charset=UTF-8",
			"Cache-Control": "public, max-age=900, stale-while-revalidate=3600",
			"Access-Control-Allow-Origin": "*",
		},
	});
}
