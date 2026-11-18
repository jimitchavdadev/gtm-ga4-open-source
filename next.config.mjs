/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		const rustEngineUrl =
			process.env.RUST_ENGINE_URL || "http://127.0.0.1:8080";
		return {
			beforeFiles: [
				{
					source: "/api/v1/:path*",
					destination: `${rustEngineUrl}/api/v1/:path*`,
				},
				{
					source: "/v1beta/:path*",
					destination: `${rustEngineUrl}/v1beta/:path*`,
				},
				{
					source: "/_trk/:path*",
					destination: `${rustEngineUrl}/_trk/:path*`,
				},
				{
					source: "/g/collect",
					destination: `${rustEngineUrl}/g/collect`,
				},
				{
					source: "/mp/collect",
					destination: `${rustEngineUrl}/mp/collect`,
				},
				{
					source: "/debug/mp/collect",
					destination: `${rustEngineUrl}/debug/mp/collect`,
				},
				{
					source: "/rust/:path*",
					destination: `${rustEngineUrl}/:path*`,
				},
			],
			afterFiles: [],
			fallback: [],
		};
	},
};

export default nextConfig;
