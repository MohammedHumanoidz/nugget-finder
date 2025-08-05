import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Nugget Finder - AI-Powered Startup Ideas",
		short_name: "Nugget Finder",
		description: "Discover validated startup opportunities with AI-powered market analysis. Find your next big opportunity 5x faster with comprehensive business ideas and competitive research.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#f59e0b",
		orientation: "portrait-primary",
		scope: "/",
		lang: "en-US",
		categories: ["business", "productivity", "finance"],
		icons: [
			{
				src: "/favicon/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/favicon/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png", 
				purpose: "maskable",
			},
			{
				src: "/favicon/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
			{
				src: "/favicon/favicon-96x96.png",
				sizes: "96x96",
				type: "image/png",
			},
		],
		shortcuts: [
			{
				name: "Browse Ideas",
				short_name: "Browse",
				description: "Explore AI-generated startup opportunities",
				url: "/browse",
				icons: [{ src: "/favicon/favicon-96x96.png", sizes: "96x96" }],
			},
			{
				name: "Pricing",
				short_name: "Pricing",
				description: "View subscription plans and pricing",
				url: "/pricing",
				icons: [{ src: "/favicon/favicon-96x96.png", sizes: "96x96" }],
			},
		],
	};
}
