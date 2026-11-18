/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: ["node:sqlite"],
	async rewrites() {
		const rustEngineUrl =
			process.env.RUST_ENGINE_URL || "http://127.0.0.1:8080";
		return [
			{
				source: "/rust/g/collect",
				destination: `${rustEngineUrl}/g/collect`,
			},
			{
				source: "/rust/mp/collect",
				destination: `${rustEngineUrl}/mp/collect`,
			},
			{
				source: "/rust/debug/mp/collect",
				destination: `${rustEngineUrl}/debug/mp/collect`,
			},
			{
				source: "/rust/api/v1/:path*",
				destination: `${rustEngineUrl}/api/v1/:path*`,
			},
		];
	},
};

export default nextConfig;
