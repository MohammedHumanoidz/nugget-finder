import { Suspense } from "react";
import { PricingPage } from "@/components/PricingPage";
import { Loader2 } from "lucide-react";

function PricingPageFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading pricing...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background">      
      <Suspense fallback={<PricingPageFallback />}>
        <PricingPage showFreeOption={true} />
      </Suspense>
    </div>
  );
}