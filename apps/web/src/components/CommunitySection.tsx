import { Card, CardContent } from "./ui/card";

export default function CommunitySection() {
  const testimonials = [
    {
      name: "Sarah Martinez",
      role: "Founder, SecurePrompt",
      quote:
        "NuggetFinder surfaced a market shift months before it went mainstream. It directly shaped our roadmap.",
    },
    {
      name: "James Chen",
      role: "CTO, Unified AI",
      quote:
        "We rely on it weekly to spot emergent patterns and opportunities we would otherwise miss.",
    },
    {
      name: "Emily Wang",
      role: "Head of Product, CreatorOS",
      quote:
        "It’s our secret weapon for prioritizing bets confidently and moving faster.",
    },
  ];

  const logos = ["/favicon/favicon.svg", "/logo.webp"];

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-3xl font-bold">Built with NuggetFinder</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Card key={`${t.name}-${i.toString()}`} className="border border-border bg-card/50">
              <CardContent className="p-6">
                <blockquote className="text-foreground">“{t.quote}”</blockquote>
                <div className="mt-4 text-sm text-muted-foreground">
                  {t.name} • {t.role}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-6 opacity-80">
          {logos.map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`logo-${idx.toString()}`} src={src} alt="Company logo" className="h-8" />
          ))}
        </div>
      </div>
    </section>
  );
} 