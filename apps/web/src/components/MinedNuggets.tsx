import { ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { serverTRPC } from "@/lib/server-trpc";
import { Badge } from "@/components/ui/badge";

interface MinedIdeaItem {
  id: string;
  prompt: string;
  title: string;
  description: string;
  executiveSummary: string;
  problemStatement: string;
  narrativeHook: string;
  tags: string[];
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export default async function MinedNuggets() {
  // Fetch data server-side
  const [minedIdeas, limits] = await Promise.all([
    serverTRPC.getMinedIdeas(),
    serverTRPC.getUserLimits(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/browse">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Link>
          </Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">⛏️ Your Mined Nuggets</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Business ideas you've personally generated and mined
          </p>
          
          <div className="text-sm text-muted-foreground">
            You have {minedIdeas?.length || 0} mined nuggets
          </div>
        </div>
      </div>

      {/* Content */}
      {minedIdeas && minedIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {minedIdeas.map((idea: MinedIdeaItem) => {
            return (
              <Card 
                key={idea.id} 
                className="hover:shadow-lg transition-all h-full flex flex-col"
              >
                <CardHeader className="flex-1">
                  <div className="flex flex-col items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl flex-1">
                      {idea.title || "Untitled Idea"}
                    </CardTitle>
                  </div>
                  
                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {idea.tags.slice(0, 3).map((tag) => (
                        <Badge key={`${idea.id}-${tag}`} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {idea.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{idea.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3 mb-3">
                    {idea.description || idea.executiveSummary || "No description available for this business idea."}
                  </p>
                  
                  {/* Original Prompt */}
                  <div className="mt-3 p-2 rounded-md border">
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <Lightbulb className="h-3 w-3" />
                      <span className="font-medium">Original Prompt</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      "{idea.prompt}"
                    </p>
                  </div>
                  
                  <div className="mt-3 text-xs text-muted-foreground">
                    Generated on {new Date(idea.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/nugget/mined/${idea.id}`}>
                      View Full Details →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⛏️</div>
          <h3 className="text-lg font-semibold mb-2">No mined nuggets yet</h3>
          <p className="text-muted-foreground mb-6">
            Generate your first business ideas by describing what you'd like to build
          </p>
          <div className="max-w-md mx-auto mb-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">How to mine nuggets?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Go to the homepage and describe your interests</li>
              <li>• Our AI will generate personalized business ideas</li>
              <li>• Your generated ideas become your "mined nuggets"</li>
              <li>• Access them anytime from here</li>
            </ul>
          </div>
          <Button asChild>
            <Link href="/">
              Start Mining Ideas
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
} 