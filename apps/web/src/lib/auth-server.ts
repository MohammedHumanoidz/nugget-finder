import { cookies } from "next/headers";

export interface User {
	id: string;
	name: string;
	email: string;
	image?: string;
}

export interface Session {
	user: User;
	token: string;
	expiresAt: Date;
}

/**
 * Get the current session on the server side
 * This checks the session cookie and validates it with the auth server
 */
export async function getServerSession(): Promise<Session | null> {
	try {
		const cookieStore = await cookies();
		const sessionToken = cookieStore.get("better-auth.session_token")?.value;

		if (!sessionToken) {
			return null;
		}

		// Verify session with the auth server
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/session`,
			{
				headers: {
					Cookie: `better-auth.session_token=${sessionToken}`,
				},
				cache: "no-store", // Always get fresh session data
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		if (!data.user) {
			return null;
		}

		return {
			user: data.user as User,
			token: sessionToken,
			expiresAt: new Date(data.expiresAt),
		};
	} catch (error) {
		console.error("Failed to get server session:", error);
		return null;
	}
}
