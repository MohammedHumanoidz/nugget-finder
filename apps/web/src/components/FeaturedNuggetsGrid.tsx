import NuggetsCards from "./nuggetsCards";
import type { FeaturedNugget } from "./nuggetsCards";

export default function FeaturedNuggetsGrid({
  nuggets,
}: {
  nuggets: FeaturedNugget[];
}) {
  if (!nuggets || nuggets.length === 0) return null;

  // Pick the largest card (for now, just the first one)
  const centerCard = nuggets[0];
  const leftCards = nuggets.slice(1, Math.ceil(nuggets.length / 2));
  const rightCards = nuggets.slice(Math.ceil(nuggets.length / 2));

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-8 space-y-2">
          <h2 className="text-center font-bold text-3xl">
            {" "}
            Freshly-Mined Money-Making Ideas
          </h2>
          <p className="text-center text-muted-foreground">
            These are the top ideas that have been mined today.
          </p>
        </div>

        {/* Custom 3-column layout */}
        <div className="grid grid-cols-1 items-center justify-center gap-6 lg:grid-cols-[1fr_1.5fr_1fr]">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            {leftCards.map((n) => (
              <NuggetsCards key={n.id} nugget={n} />
            ))}
          </div>

          {/* Center Column (largest card) */}
          <div className="flex flex-col items-center justify-center">
            <NuggetsCards
              nugget={centerCard}
              className="scale-105 border-primary/50 shadow-lg"
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {rightCards.map((n) => (
              <NuggetsCards key={n.id} nugget={n} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
