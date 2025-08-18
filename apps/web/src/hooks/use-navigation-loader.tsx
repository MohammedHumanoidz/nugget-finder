"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface NavigationLoaderContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  loadingMessage: string;
}

const NavigationLoaderContext = createContext<NavigationLoaderContextType | undefined>(undefined);

export function NavigationLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const startLoading = useCallback((message = "Loading...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage("Loading...");
  }, []);

  return (
    <NavigationLoaderContext.Provider
      value={{
        isLoading,
        startLoading,
        stopLoading,
        loadingMessage,
      }}
    >
      {children}
    </NavigationLoaderContext.Provider>
  );
}

export function useNavigationLoader() {
  const context = useContext(NavigationLoaderContext);
  if (context === undefined) {
    throw new Error("useNavigationLoader must be used within a NavigationLoaderProvider");
  }
  return context;
}
