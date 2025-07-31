import { PricingPage } from "@/components/PricingPage";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">      
      <PricingPage showFreeOption={true} />
    </div>
  );
}