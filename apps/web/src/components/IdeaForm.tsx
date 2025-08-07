"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowUpRight, Settings } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";
import PersonalizationModal, { type PersonalizationData } from "./PersonalizationModal";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import AnimatedSearchLoader from "./AnimatedSearchLoader";

const IdeaForm = () => {
  const router = useRouter();
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
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
      setIsGenerating(false);
      toast.success(`🎉 We've found ${generationStatus.generatedIdeaIds.length} golden nuggets for you!`);
      const ideaIds = generationStatus.generatedIdeaIds.join(',');
      router.push(`/browse/results?ids=${ideaIds}`);
    } else if (generationStatus?.status === 'FAILED') {
      console.log('[DEBUG] Generation failed:', generationStatus.errorMessage);
      setIsGenerating(false);
      toast.error(generationStatus.errorMessage || "Failed to generate ideas. Please try again.");
    }
  }, [generationStatus, router]);

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
      
      // Call the generate ideas mutation instead of redirecting to browse
      generateIdeasMutation.mutate({ query: value.idea });
    },
  });

  const handleDefaultIdeaClick = (idea: string) => {
    form.setFieldValue("idea", idea);
  };

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

      {/* Personalization Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPersonalizationModal(true)}
          className="h-auto px-4 py-2 text-sm"
        >
          <Settings className="mr-2 h-4 w-4" />
          {personalizationData ? "Update Search Profile" : "Personalize Search"}
        </Button>
      </div>

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
