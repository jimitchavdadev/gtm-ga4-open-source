/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		const rustEngineUrl =
			process.env.RUST_ENGINE_URL || "http://127.0.0.1:8080";
		return {
			beforeFiles: [
				// First-Party Custom Event Ingestion Endpoints
				{
					source: "/api/events/collect",
					destination: `${rustEngineUrl}/api/v1/events/collect`,
				},
				{
					source: "/api/events/batch",
					destination: `${rustEngineUrl}/api/v1/events/batch`,
				},
				{
					source: "/api/events/validate",
					destination: `${rustEngineUrl}/api/v1/events/validate`,
				},
				{
					source: "/api/events/pixel",
					destination: `${rustEngineUrl}/api/v1/events/pixel`,
				},
				{
					source: "/api/events/:path*",
					destination: `${rustEngineUrl}/api/v1/events/:path*`,
				},
				// First-Party Custom Analytics Suite
				{
					source: "/api/analytics/:path*",
					destination: `${rustEngineUrl}/api/v1/analytics/:path*`,
				},
				// First-Party Custom Tag Manager Suite
				{
					source: "/api/tag-manager/:path*",
					destination: `${rustEngineUrl}/api/v1/tag-manager/:path*`,
				},
				// First-Party Custom Admin Suite
				{
					source: "/api/admin/:path*",
					destination: `${rustEngineUrl}/api/v1/admin/:path*`,
				},
				// Unified First-Party Ingestion & Obfuscation
				{
					source: "/api/v1/:path*",
					destination: `${rustEngineUrl}/api/v1/:path*`,
				},
				{
					source: "/_trk/:path*",
					destination: `${rustEngineUrl}/_trk/:path*`,
				},
				// Legacy Google Analytics Aliases for Drop-in Compatibility
				{
					source: "/g/collect",
					destination: `${rustEngineUrl}/api/v1/events/collect`,
				},
				{
					source: "/mp/collect",
					destination: `${rustEngineUrl}/api/v1/events/batch`,
				},
				{
					source: "/debug/mp/collect",
					destination: `${rustEngineUrl}/api/v1/events/validate`,
				},
				{
					source: "/v1beta/:path*",
					destination: `${rustEngineUrl}/v1beta/:path*`,
				},
			],
			afterFiles: [],
			fallback: [],
		};
	},
};

export default nextConfig;
