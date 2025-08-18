"use client";

import { LoadingOverlay } from "./ui/loading-overlay";
import { useNavigationLoader } from "@/hooks/use-navigation-loader";
import { useRouteChange } from "@/hooks/use-route-change";

export function NavigationLoader() {
  const { isLoading, loadingMessage } = useNavigationLoader();
  
  // Listen for route changes to stop loading
  useRouteChange();

  return <LoadingOverlay isLoading={isLoading} message={loadingMessage} />;
}
