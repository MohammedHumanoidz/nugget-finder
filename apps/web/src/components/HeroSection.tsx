"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowRight, CheckCircle2, Hourglass, ArrowDown } from "lucide-react";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/browse?q=${encodeURIComponent(q)}`);
  };

  const scrollToNextSection = () => {
    const nextSection = document.querySelector("#featured-nuggets");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background animated trend lines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <svg
          aria-hidden="true"
          role="presentation"
          focusable="false"
          className="absolute left-1/2 top-0 h-[120%] w-[120%] -translate-x-1/2 opacity-[0.08] dark:opacity-[0.12]"
          viewBox="0 0 800 600"
          fill="none"
        >
          <path
            d="M0,500 C150,420 250,460 400,400 C550,340 650,360 800,300"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/40"
          >
            <animate
              attributeName="d"
              dur="6s"
              repeatCount="indefinite"
              values="M0,500 C150,420 250,460 400,400 C550,340 650,360 800,300; M0,520 C150,440 250,430 400,420 C550,360 650,380 800,320; M0,500 C150,420 250,460 400,400 C550,340 650,360 800,300"
            />
          </path>
        </svg>
      </div>

      <div className="mx-auto grid grid-cols-1 items-center gap-10 px-4 py-16 md:px-24 md:py-16 lg:grid-cols-2">
        {/* Left column */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Find Your Next Big Business Opportunity{" "}
            <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              Before Anyone Else
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            We scan 1,200+ market signals daily to uncover high-purity,
            ready-to-mine startup ideas — before the rest of the world catches
            on.
          </p>

          {/* Search bar */}
          <form onSubmit={onSubmit} className="mt-8">
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Input
                aria-label="Search ideas"
                placeholder="What do you want to build?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 rounded-xl shadow-sm"
              />
              <Button type="submit" className="h-12 rounded-xl px-6">
                Find Nuggets <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
              No sign-up needed
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-muted-foreground">
              <Hourglass className="h-4 w-4 text-amber-500" aria-hidden />
              Well refined nuggets
            </span>
          </div>
        </div>

        {/* Right column visual */}
        <div className="relative flex items-center justify-center">
          <div className="relative">
            <Image
              src="/geometric-miner-with-glowing-crystal.png"
              alt="Miner illustration holding a glowing nugget"
              width={560}
              height={560}
              priority
              className="drop-shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        aria-hidden
        className="pointer-events-none relative -mt-6 h-16 w-full bg-gradient-to-b from-transparent to-background"
      />

      {/* Blinking Arrow Down CTA */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-sm font-medium">Checkout our featured nuggets updated daily</span>
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={scrollToNextSection}
          className="group flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground rounded-full border-primary"
          aria-label="Scroll to featured nuggets"
        >
          <ArrowDown className="h-6 w-6 animate-bounce group-hover:text-primary transition-colors" />
        </Button>
      </div>
    </section>
  );
}
