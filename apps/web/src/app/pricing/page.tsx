import { PricingPage } from "@/components/PricingPage";
import Navbar from "@/components/Navbar";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PricingPage showFreeOption={true} />
    </div>
  );
}