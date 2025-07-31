import { Scene } from "@/components/BoxedAnimation";
import IdeaForm from "@/components/IdeaForm";
import { PricingPage } from "@/components/PricingPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTodaysTopIdeas } from "@/lib/server-api";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

// Server component with SSR
export default async function Page() {
  const todaysIdeas = await getTodaysTopIdeas();

  return (
    <div className="min-h-screen w-full">
      <div className="z-10 flex flex-col items-center justify-center gap-12">
        <IdeaForm />
      </div>
      <div className="absolute inset-0 opacity-10 dark:opacity-30">
        <Scene />
      </div>

      <div className="relative z-10 mt-20 w-full flex flex-col items-center justify-center gap-12">
        <p className="text-center font-medium text-2xl">
          Today&apos;s finest nuggets
        </p>
        <div className="flex items-center justify-center gap-4 w-full">
          {todaysIdeas?.map((idea) => (
            <Card
              key={idea.id}
              className="w-96 transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl border border-yellow-400/20 bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950 dark:border-zinc-700"
            >
              <CardHeader className="flex items-start justify-between space-y-2">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-yellow-800 dark:text-primary">
                    💡 {idea.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {idea.narrativeHook}
                  </CardDescription>
                </div>
                <Badge className="text-sm bg-yellow-200 text-yellow-900 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800">
                  {idea.ideaScore?.totalScore?.toFixed(1)}
                </Badge>
              </CardHeader>

              <CardContent className="text-sm leading-relaxed space-y-2 text-gray-800 dark:text-gray-200">
                <p>{idea.problemSolution}</p>
              </CardContent>

              <CardFooter className="flex items-center justify-end">
                <Link href={`/nugget/${idea.id}`}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    View Nugget <ArrowUpRight />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}

          {todaysIdeas?.length === 0 && (
            <p className="text-gray-300 text-center">
              No ideas generated today yet
            </p>
          )}
        </div>
        <PricingPage />
      </div>
    </div>
  );
}
