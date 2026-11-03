export async function GET() {
	return Response.json(
		{ status: "ok", timestamp: Date.now() },
		{
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Cache-Control": "no-store",
			},
		},
	);
}
