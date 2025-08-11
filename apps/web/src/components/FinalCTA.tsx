import { Clock, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function FinalCTA() {
	return (
		<section className="w-full">
			<div className="mx-auto max-w-5xl rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-amber-100/20 to-transparent px-4 py-14 dark:from-primary/10 dark:via-primary/5 dark:to-transparent">
				<div className="text-center">
					<h3 className="font-bold text-2xl">
						Start Discovering Your First Nugget Today
					</h3>
					<p className="mt-2 text-muted-foreground">
						Try it free — no sign-up required
					</p>
					<div className="mt-6">
						<Link href="/auth/sign-up">
							<Button size="lg">Start Now</Button>
						</Link>
					</div>
					<div className="mt-4 flex items-center justify-center gap-6 text-muted-foreground text-sm">
						<div className="inline-flex items-center gap-2">
							<Clock className="h-4 w-4" /> Get your first nugget in under 60
							seconds
						</div>
						<div className="inline-flex items-center gap-2">
							<CreditCard className="h-4 w-4" /> No credit card needed
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
