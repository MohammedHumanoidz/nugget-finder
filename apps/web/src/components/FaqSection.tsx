"use client";

import Image from "next/image";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ Component
export default function FAQSection() {
	const faqs = [
		{
			question: "How is the idea scoring system calculated?",
			answer:
				"Our AI analyzes multiple factors including market size, technical feasibility, competitive landscape, timing indicators, and problem severity. Each idea receives scores across these dimensions, combined into a total score from 1-10.",
		},
		{
			question: "Can I use these ideas to build my own startup?",
			answer:
				"Absolutely! These are market opportunities and insights, not proprietary business plans. We encourage entrepreneurs to build upon these ideas, validate them, and create amazing companies.",
		},
		{
			question: "What does 'claiming' an idea mean?",
			answer:
				"Claiming an idea shows you're actively pursuing it, helps track community interest, and gives you access to additional research and connections with others working on similar problems.",
		},
		{
			question: "How often are new ideas generated?",
			answer:
				"Our AI agents continuously analyze market signals and generate new ideas daily. Premium subscribers get early access to the highest-scoring opportunities.",
		},
		{
			question: "Is there an API for accessing ideas programmatically?",
			answer:
				"Yes! Pro and Enterprise subscribers get API access to integrate our idea discovery system into their own workflows and tools.",
		},
	];

	return (
		<div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
			<Image
				src="/nuggetfinder-confused.png"
				alt="confused"
				width={300}
				height={300}
			/>

			<div className="flex flex-col gap-4">
				<Accordion type="single" collapsible className="w-full">
					{faqs.map((faq, index) => (
						<AccordionItem key={faq.question} value={`item-${index + 1}`}>
							<AccordionTrigger className="text-left hover:no-underline">
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground leading-relaxed">
								{faq.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</div>
	);
}
