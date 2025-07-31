"use client";

import { AuthCard } from "@daveyplate/better-auth-ui";

export function AuthView({ pathname }: { pathname: string }) {
  return (
    <main className="flex h-screen flex-col bg-background">
      <div className="mx-auto flex w-full grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
        <AuthCard pathname={pathname} />
      </div>
    </main>
  );
}
