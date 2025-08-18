"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigationLoader } from "./use-navigation-loader";

export function useRouteChange() {
  const pathname = usePathname();
  const { stopLoading } = useNavigationLoader();

  useEffect(() => {
    // Stop loading when route changes
    stopLoading();
  }, [pathname, stopLoading]);
}
