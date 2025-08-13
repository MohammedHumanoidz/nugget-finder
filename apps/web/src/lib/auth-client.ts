import { stripeClient } from "@better-auth/stripe/client";
import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	plugins: [
		customSessionClient(),
		stripeClient({
			subscription: true,
		}),
	],
});
