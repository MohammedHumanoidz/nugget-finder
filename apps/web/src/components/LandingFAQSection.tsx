"use client";

import Image from "next/image";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
	{
		q: "How does NuggetFinder find opportunities?",
		a: "We continuously analyze thousands of public sources, research repositories, community discussions, and adoption signals. Our AI agents correlate these into high-confidence patterns and opportunity briefs.",
	},
	{
		q: "Can I try it without signing up?",
		a: "Yes. You can explore and discover featured ideas without creating an account.",
	},
	{
		q: "How accurate are the signals?",
		a: "Signals are probabilistic. We optimize for precision and recency by triangulating multiple sources and filtering noise across time.",
	},
	{
		q: "What makes an idea high-purity?",
		a: "High-purity ideas score strongly across problem severity, timing, feasibility, defensibility, and monetization potential.",
	},
	{
		q: "How often are new nuggets generated?",
		a: "Daily. New insights and ideas are surfaced as market signals shift.",
	},
];

export default function LandingFAQSection() {
	return (
		<section className="flex w-full flex-col items-center justify-center gap-12 lg:flex-row">
			<Image
				src="/nuggetfinder-confused.png"
				alt="Logo"
				width={400}
				height={400}
			/>
			<div className="px-4 py-16">
				<h2 className="mb-6 text-center font-bold text-3xl">
					Frequently Asked Questions
				</h2>
				<Accordion type="single" collapsible className="w-full w-xl">
					{faqs.map((item, idx) => (
						<AccordionItem
							key={`${item.q}-${idx.toString()}`}
							value={`item-${idx.toString()}`}
						>
							<AccordionTrigger className="text-left hover:no-underline">
								{item.q}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground">
								{item.a}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
