import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import type { BetterAuthOptions, Session, User } from "better-auth";

type AuthSession = {
  user: User;
  session: Session;
};

type Auth = {
  options: BetterAuthOptions & AuthSession;
};

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    stripeClient({
      subscription: true,
      stripeAccountId: process.env.STRIPE_ACCOUNT_ID,
    }),
    // customSessionClient<Auth>(),
  ],
});
