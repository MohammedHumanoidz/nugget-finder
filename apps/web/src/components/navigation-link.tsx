"use client";

import Link from "next/link";
import { useNavigationLoader } from "@/hooks/use-navigation-loader";
import type { ComponentProps } from "react";

interface NavigationLinkProps extends ComponentProps<typeof Link> {
  loadingMessage?: string;
}

export function NavigationLink({ 
  children, 
  href, 
  loadingMessage = "Loading...", 
  ...props 
}: NavigationLinkProps) {
  const { startLoading } = useNavigationLoader();

  const handleClick = () => {
    startLoading(loadingMessage);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
