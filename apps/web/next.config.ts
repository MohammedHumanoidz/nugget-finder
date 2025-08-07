import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: false,
	},
	eslint: {
		ignoreDuringBuilds: false,
	},
	experimental: {
		typedRoutes: false,
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	async redirects() {
		return [
			{
				source: "/:path*",
				destination: "https://nuggetfinder.ai/:path*",
				permanent: true,
				has: [
					{
						type: "host",
						value: "www.nuggetfinder.ai",
					},
				],
			},
		];
	},
	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
			{
				source: "/ingest/flags",
				destination: "https://us.i.posthog.com/flags",
			},
		];
	},
};

export default nextConfig;
