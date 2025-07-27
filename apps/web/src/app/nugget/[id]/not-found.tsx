import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Nugget Not Found</h1>
          <p className="text-lg text-muted-foreground mb-8">
            The nugget you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}