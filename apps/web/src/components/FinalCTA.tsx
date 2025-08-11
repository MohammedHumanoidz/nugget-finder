import Link from "next/link";
import { Button } from "./ui/button";
import { Clock, CreditCard } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl px-4 py-14 rounded-2xl bg-gradient-to-r from-primary/10 via-amber-100/20 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent border border-border">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Start Discovering Your First Nugget Today</h3>
          <p className="mt-2 text-muted-foreground">Try it free — no sign-up required</p>
          <div className="mt-6">
            <Link href="/auth/sign-up">
              <Button size="lg">Start Now</Button>
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> Get your first nugget in under 60 seconds</div>
            <div className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" /> No credit card needed</div>
          </div>
        </div>
      </div>
    </section>
  );
} 