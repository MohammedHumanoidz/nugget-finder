"use client";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AdminLayoutClient from "./admin-layout-client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-primary" />
          <p className="text-foreground text-sm">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if ((!session?.user || (session.user as any).role !== "admin") && !isPending) {
    redirect("/auth/sign-in");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
