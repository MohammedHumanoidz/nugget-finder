import { SignedIn, SignedOut, UserAvatar } from "@daveyplate/better-auth-ui";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛏️</span>
            <span className="font-semibold text-lg">NuggetFinder.io</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/browse"
            className="text-muted-foreground hover:text-foreground"
          >
            Browse
          </Link>
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <SignedOut>
            <Link
              href="/auth/sign-in"
              className="text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-muted-foreground hover:text-foreground"
            >
              Sign up
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/subscription"
              className="text-muted-foreground hover:text-foreground"
            >
              Subscription
            </Link>
            <UserAvatar />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
