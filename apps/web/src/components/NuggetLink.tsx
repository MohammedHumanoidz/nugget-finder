"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNonAuthViewTracker } from "@/hooks/useNonAuthViewTracker";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Lock } from "lucide-react";

interface NuggetLinkProps {
  ideaId: string;
  children: React.ReactNode;
  className?: string;
}

export default function NuggetLink({ ideaId, children, className }: NuggetLinkProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;
  
  const {
    isLoaded,
    hasViewedIdea,
    canViewNewIdea,
    getRemainingViews,
  } = useNonAuthViewTracker();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // For authenticated users, let them navigate normally
    if (isAuthenticated) {
      return; // Continue with normal navigation
    }

    // For non-authenticated users, check localStorage limits
    if (!isLoaded) {
      e.preventDefault();
      return;
    }

    const alreadyViewed = hasViewedIdea(ideaId);
    const canViewNew = canViewNewIdea();

    if (alreadyViewed || canViewNew) {
      // User can access this idea, continue with navigation
      return;
    }

    // User has exceeded their limit, prevent navigation and show upgrade modal
    e.preventDefault();
    setShowUpgradeModal(true);
  };

  return (
    <>
      <Link href={`/nugget/${ideaId}`} className={className} onClick={handleClick}>
        {children}
      </Link>

      {/* Upgrade Modal for non-authenticated users who hit the limit */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              You've hit your free limit!
            </DialogTitle>
            <DialogDescription>
              You've already viewed your {getRemainingViews() === 0 ? 'free' : ''} nugget today. 
              Want to explore more startup opportunities?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              🚀 Get unlimited access to our entire library of AI-generated startup ideas
            </p>
            
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/pricing" onClick={() => setShowUpgradeModal(false)}>
                  View Pricing Plans <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/sign-in" onClick={() => setShowUpgradeModal(false)}>
                  Sign In Instead
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Already have an account? Sign in to access your subscription benefits.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 