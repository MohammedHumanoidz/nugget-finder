"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { NavigationLoaderProvider } from "@/hooks/use-navigation-loader";
import { NavigationLoader } from "./navigation-loader";

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <NavigationLoaderProvider>
        <AuthUIProvider
          authClient={authClient}
          navigate={router.push}
          replace={router.replace}
          onSessionChange={() => {
            router.refresh();
          }}
          redirectTo={process.env.NEXT_PUBLIC_APP_URL || "https://nuggetfinder.ai"}
          social={{
            providers: ["google"],
          }}
          Link={Link}
        >
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools />
          </QueryClientProvider>
          <Toaster richColors />
        </AuthUIProvider>
        <NavigationLoader />
      </NavigationLoaderProvider>
    </ThemeProvider>
  );
}
