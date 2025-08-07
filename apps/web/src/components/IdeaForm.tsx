"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowUpRight, Settings, Info } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";
import PersonalizationModal, { type PersonalizationData } from "./PersonalizationModal";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import AnimatedSearchLoader from "./AnimatedSearchLoader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const IdeaForm = () => {
  const router = useRouter();
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ideaCount, setIdeaCount] = useState("1");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  // Check authentication state
  const { data: session, isPending } = authClient.useSession();

  // Use trpc mutation for generating ideas on demand
  const generateIdeasMutation = useMutation(trpc.ideas.generateOnDemand.mutationOptions({
    onSuccess: (data: { requestId: string }) => {
      setRequestId(data.requestId);
      setIsGenerating(true);
    },
    onError: (error: any) => {
      toast.error("❌ An unexpected error occurred while digging for ideas. Please try again.");
      console.error("Generate ideas error:", error);
      setIsGenerating(false);
    },
  }));

  // Poll for generation status using trpc query with adaptive intervals
  const { data: generationStatus } = useQuery({
    ...trpc.ideas.getGenerationStatus.queryOptions({ requestId: requestId || "" }),
    enabled: !!requestId && isGenerating,
    refetchInterval: (query) => {
      // Use faster polling during active generation, slower for completed states
      const data = query.state.data;
      if (!data || data.status === 'RUNNING') {
        return 1000; // Poll every 1 second during generation
      }
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        return false; // Stop polling when done
      }
      return 2000; // Default fallback
    },
    refetchIntervalInBackground: true,
  });

  // Handle completion
  React.useEffect(() => {
    if (generationStatus) {
      console.log('[DEBUG] Generation status update:', generationStatus);
    }
    
    if (generationStatus?.status === 'COMPLETED' && generationStatus.generatedIdeaIds.length > 0) {
      console.log('[DEBUG] Generation completed, redirecting to results...');
      const endTime = new Date();
      const processingTime = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) : 0;
      
      setIsGenerating(false);
      
      // Show success message with processing time
      toast.success(`🎉 We've found ${generationStatus.generatedIdeaIds.length} golden nuggets for you! Processing time: ${processingTime}s`);
      
      const ideaIds = generationStatus.generatedIdeaIds.join(',');
      router.push(`/browse/results?ids=${ideaIds}`);
    } else if (generationStatus?.status === 'FAILED') {
      console.log('[DEBUG] Generation failed:', generationStatus.errorMessage);
      setIsGenerating(false);
      toast.error(generationStatus.errorMessage || "Failed to generate ideas. Please try again.");
    }
  }, [generationStatus, router, startTime]);

  const form = useForm({
    defaultValues: {
      idea: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.idea.trim()) return;
      
      // Check if user is authenticated
      if (!session && !isPending) {
        router.push('/auth/sign-in');
        return;
      }
      
      // Store personalization data in sessionStorage if available
      if (personalizationData) {
        sessionStorage.setItem('personalizationData', JSON.stringify(personalizationData));
      }
      
      // Store the search query for the loading screen
      setSearchQuery(value.idea);
      setStartTime(new Date());
      
      // Show warning for multiple ideas
      if (Number.parseInt(ideaCount) > 1) {
        toast.info(`⏳ Generating ${ideaCount} ideas will take longer. Please be patient!`);
      }
      
      // Call the generate ideas mutation instead of redirecting to browse
      generateIdeasMutation.mutate({ query: value.idea, count: Number.parseInt(ideaCount) });
    },
  });

  const handlePersonalizationSave = (data: PersonalizationData) => {
    setPersonalizationData(data);
    setShowPersonalizationModal(false);
    toast.success("Personalization settings saved!");
  };

  // Show loading screen when generating
  if (isGenerating && searchQuery) {
    return (
      <AnimatedSearchLoader 
        searchQuery={searchQuery}
        progressMessage={generationStatus?.progressMessage || "Initializing idea generation pipeline..."}
        imageState={generationStatus?.imageState || "confused"}
        currentStep={generationStatus?.currentStep || "Starting Research"}
        onAnimationComplete={() => {
          // This won't be called now since we're handling completion via polling
        }}
      />
    );
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-4xl space-y-6 z-50">
      {/* Form Section */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
        <Image
          src="/nuggetfinder-super-happy.png"
          alt="mine nuggets"
          width={100}
          height={100}
        />
        <p className="text-center font-semibold text-4xl">
          Find Your Golden Business Opportunity Before Anyone Else
        </p>
      </div>

      {/* Settings Row */}
      <div className="flex justify-center items-center gap-4 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPersonalizationModal(true)}
          className="h-auto px-4 py-2 text-sm"
        >
          <Settings className="mr-2 h-4 w-4" />
          {personalizationData ? "Update Search Profile" : "Personalize Search"}
        </Button>
        
        {/* Idea Count Selector */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ideas to generate:</span>
          <Select value={ideaCount} onValueChange={(value) => {
            setIdeaCount(value);
            setShowTimeWarning(false);
          }}>
            <SelectTrigger className="w-20 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Time Warning */}
      {Number.parseInt(ideaCount) > 1 && (
        <div className="flex justify-center">
          <div className="border px-4 py-2 rounded-lg text-sm flex items-center gap-2 max-w-md">
            <Info className="h-4 w-4" />
            <span>Generating {ideaCount} ideas will take approximately {Number.parseInt(ideaCount) * 2}-{Number.parseInt(ideaCount) * 3} minutes</span>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="relative"
      >
        <form.Field name="idea">
          {(field) => (
            <div className="relative">
              <Textarea
                placeholder="I'll dig for opportunities that match you! Tell me about yourself or type 'discover' to see what's trending"
                className="min-h-40 pr-20 rounded-3xl p-6 backdrop-blur-xs border-primary dark:border-primary/20"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="absolute right-4 bottom-4"
                    disabled={!canSubmit || !field.state.value.trim() || generateIdeasMutation.isPending || isPending}
                  >
                    {isPending ? "Loading..." : generateIdeasMutation.isPending ? "Mining..." : "Start Mining"}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                )}
              </form.Subscribe>
            </div>
          )}
        </form.Field>
      </form>

      {/* Personalization Modal */}
      <PersonalizationModal
        isOpen={showPersonalizationModal}
        onClose={() => setShowPersonalizationModal(false)}
        onSave={handlePersonalizationSave}
        initialData={personalizationData || undefined}
      />
    </div>
  );
};

export default IdeaForm;
