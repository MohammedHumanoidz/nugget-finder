import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
	try {
		// Call the TRPC endpoint on the server
		const response = await fetch(`${SERVER_URL}/trpc/subscription.getPlans`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			console.error(`Server responded with ${response.status}: ${response.statusText}`);
			throw new Error(`Server responded with ${response.status}`);
		}

		const data = await response.json();
		console.log("Plans data received:", data);
		
		// Return the plans data - TRPC wraps data in result.data
		return NextResponse.json(data.result?.data || data);
	} catch (error: any) {
		console.error("Error fetching plans:", error);
		return NextResponse.json(
			{ error: "Failed to fetch plans", details: error.message },
			{ status: 500 }
		);
	}
}