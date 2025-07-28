import BrowseClient from "@/components/BrowseClient";
import Navbar from "@/components/Navbar";

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BrowseClient />
    </div>
  );
}