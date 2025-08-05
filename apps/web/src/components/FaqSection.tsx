"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

// FAQ Component - Enhanced for SEO and accessibility
export default function FAQSection() {
  const faqs = [
    {
      question: "How quickly can I launch a startup with Nugget Finder?",
      answer:
        "Entrepreneurs typically launch validated startup ideas 3-5x faster using Nugget Finder's AI-powered market analysis. Our platform provides complete business frameworks, competitive research, and execution plans that save 3-4 weeks of initial research time.",
    },
    {
      question: "What startup ideas are included?",
      answer:
        "Nugget Finder generates 50+ new AI-powered startup ideas daily across technology sectors including AI/ML, fintech, healthtech, climate tech, and developer tools. Each idea includes market size analysis, competitive landscape, and technical feasibility scores.",
    },
    {
      question: "How do I integrate market intelligence into my workflow?",
      answer:
        "Pro subscribers get API access to integrate real-time startup intelligence into existing tools. Our platform tracks 12,000+ market trends and analyzes 35,000+ signals daily to identify emerging opportunities before they become mainstream.",
    },
    {
      question: "What makes Nugget Finder different from other idea platforms?",
      answer:
        "Nugget Finder uses advanced AI to provide comprehensive startup validation including market analysis, competitive research, technical roadmaps, and execution plans. Unlike simple idea generators, we deliver complete business frameworks with 68-89% accuracy in trend prediction.",
    },
    {
      question: "Can I claim and pursue ideas from the platform?",
      answer:
        "Absolutely! All ideas are market opportunities available for entrepreneurs to pursue. Claiming an idea provides access to additional research, connects you with other builders, and unlocks advanced execution resources including technical specifications and go-to-market strategies.",
    },
  ];

  return (
    <div className="flex items-center justify-between gap-4">
      <Image
        src="/nuggetfinder-confused.png"
        alt="Nugget Finder mascot looking confused while analyzing startup data, representing entrepreneurs seeking clarity on business opportunities"
        width={300}
        height={300}
        priority={false}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
