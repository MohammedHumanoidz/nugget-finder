import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface FeaturedNugget {
  id: string;
  title: string;
  narrativeHook?: string;
  problemStatement?: string;
  description?: string;
  tags?: string[];
  innovationLevel?: string;
  timeToMarket?: string;
  urgencyLevel?: string;
}

interface NuggetsCardsProps {
  nugget: FeaturedNugget;
  className?: string;
}

const NuggetsCards = ({ nugget, className = "" }: NuggetsCardsProps) => (
  <Card
    key={nugget.id}
    className={`hover:-translate-y-1 h-fit w-sm rounded-xl border border-border bg-card shadow-sm transition-transform duration-300 hover:shadow-lg ${className}`}
  >
    <CardHeader className="pb-2">
      <CardTitle className="font-semibold text-xl">{nugget.title}</CardTitle>
      {nugget.narrativeHook && (
        <p className="mt-2 text-muted-foreground text-primary/80 italic">
          {nugget.narrativeHook}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {nugget.innovationLevel && (
          <Badge variant="secondary" className="text-xs">
            Innovation: {nugget.innovationLevel}
          </Badge>
        )}
        {nugget.timeToMarket && (
          <Badge variant="secondary" className="text-xs">
            Time to Market: {nugget.timeToMarket}
          </Badge>
        )}
        {nugget.urgencyLevel && (
          <Badge variant="secondary" className="text-xs">
            Urgency: {nugget.urgencyLevel}
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {nugget.problemStatement && (
        <div>
          <p className="text-foreground text-sm">{nugget.problemStatement}</p>
        </div>
      )}
      {nugget.description && (
        <p className="line-clamp-3 text-muted-foreground text-sm">
          {nugget.description}
        </p>
      )}
      {nugget.tags && nugget.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {nugget.tags.slice(0, 3).map((t, i) => (
            <span
              key={`${nugget.id}-tag-${i}`}
              className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="pt-2">
        <Link href={`/nugget/${nugget.id}`}>
          <Button variant="outline" className="w-full">
            View Full Details
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

export default NuggetsCards;
