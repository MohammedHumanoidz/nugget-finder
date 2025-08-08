import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nugget_views_non_auth';
const MAX_FREE_VIEWS = 1000;

interface ViewData {
  ideaIds: string[];
  lastReset: string; // ISO string
}

export function useNonAuthViewTracker() {
  const [viewData, setViewData] = useState<ViewData>({ ideaIds: [], lastReset: new Date().toISOString() });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored) as ViewData;
        // Reset daily (optional - you can remove this if you want persistent limits)
        const lastReset = new Date(parsedData.lastReset);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 1) {
          // Reset daily
          const newData = { ideaIds: [], lastReset: now.toISOString() };
          setViewData(newData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        } else {
          setViewData(parsedData);
        }
      } catch (error) {
        console.error('Error parsing view data from localStorage:', error);
        const newData = { ideaIds: [], lastReset: new Date().toISOString() };
        setViewData(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever viewData changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewData));
    }
  }, [viewData, isLoaded]);

  const hasViewedIdea = (ideaId: string): boolean => {
    return viewData.ideaIds.includes(ideaId);
  };

  const getViewedCount = (): number => {
    return viewData.ideaIds.length;
  };

  const canViewNewIdea = (): boolean => {
    return viewData.ideaIds.length < MAX_FREE_VIEWS;
  };

  const getRemainingViews = (): number => {
    return Math.max(0, MAX_FREE_VIEWS - viewData.ideaIds.length);
  };

  const trackView = (ideaId: string): boolean => {
    // If already viewed this idea, allow it
    if (hasViewedIdea(ideaId)) {
      return true;
    }

    // If can't view new ideas, return false
    if (!canViewNewIdea()) {
      return false;
    }

    // Track the new view
    setViewData(prev => ({
      ...prev,
      ideaIds: [...prev.ideaIds, ideaId]
    }));

    return true;
  };

  const resetViews = (): void => {
    const newData = { ideaIds: [], lastReset: new Date().toISOString() };
    setViewData(newData);
  };

  return {
    isLoaded,
    hasViewedIdea,
    getViewedCount,
    canViewNewIdea,
    getRemainingViews,
    trackView,
    resetViews,
    maxFreeViews: MAX_FREE_VIEWS
  };
} 