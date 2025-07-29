import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { serverTRPC } from "@/lib/server-trpc";
import SavedIdeasActions from "./SavedIdeasActions";

interface SavedIdeaItem {
  id: string;
  idea: {
    id: string;
    title: string;
    description: string;
    ideaScore?: {
      totalScore?: number;
      problemSeverity?: number;
      technicalFeasibility?: number;
      marketTimingScore?: number;
    } | null;
  };
  createdAt: string; // Will be string when coming from API
}

function getScoreColor(score?: number) {
  if (!score) return "text-gray-500";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export default async function SavedIdeas() {
  // Fetch data server-side
  const [savedIdeas, limits] = await Promise.all([
    serverTRPC.getSavedIdeas(),
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
          <h1 className="text-4xl font-bold mb-4">📚 Your Saved Ideas</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Ideas you've bookmarked for future reference
          </p>
          
          {limits && (
            <div className="text-sm text-muted-foreground">
              You have {savedIdeas?.length || 0} saved ideas
              {limits.savesRemaining !== -1 && ` • ${limits.savesRemaining} saves remaining`}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {savedIdeas && savedIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedIdeas.map((savedIdea: SavedIdeaItem) => {
            const idea = savedIdea.idea;
            
            return (
              <Card 
                key={idea.id} 
                className="hover:shadow-lg transition-all h-full flex flex-col"
              >
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-2 flex-1">
                      {idea.title || "Untitled Idea"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        SAVED
                      </div>
                      {idea.ideaScore?.totalScore && (
                        <div className={`text-sm font-semibold ${getScoreColor(idea.ideaScore.totalScore)}`}>
                          {idea.ideaScore.totalScore}/100
                        </div>
                      )}
                    </div>
                  </div>
                  {idea.ideaScore && (
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Problem: {idea.ideaScore.problemSeverity || 0}</span>
                      <span>•</span>
                      <span>Feasibility: {idea.ideaScore.technicalFeasibility || 0}</span>
                      <span>•</span>
                      <span>Timing: {idea.ideaScore.marketTimingScore || 0}</span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3">
                    {idea.description || "No description available for this startup opportunity."}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Saved on {new Date(savedIdea.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2">
                  <SavedIdeasActions 
                    ideaId={idea.id}
                    isSaved={true}
                    canSave={limits?.canSave || false}
                    canClaim={limits?.canClaim || false}
                  />
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/nugget/${idea.id}`}>
                      View Details →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">No saved ideas yet</h3>
          <p className="text-muted-foreground mb-6">
            Start saving startup ideas that interest you for easy access later
          </p>
          <Button asChild>
            <Link href="/browse">
              Browse Ideas
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}