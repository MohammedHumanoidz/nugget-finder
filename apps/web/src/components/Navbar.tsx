import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⛏️</span>
          <span className="font-semibold text-lg">NuggetFinder.io</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <Link href="/trends" className="text-muted-foreground hover:text-foreground">Trends</Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/signin" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          <Button>Sign up</Button>
          <Button variant="ghost" size="icon">
            <Moon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}