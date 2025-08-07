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
};

export default nextConfig;
