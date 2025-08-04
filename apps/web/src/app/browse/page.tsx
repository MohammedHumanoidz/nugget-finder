import { Suspense } from "react";
import BrowseClient from "@/components/BrowseClient";
import { Loader2 } from "lucide-react";

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-background">      
      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading ideas...</p>
            </div>
          </div>
        }
      >
        <BrowseClient />
      </Suspense>
    </div>
  );
}