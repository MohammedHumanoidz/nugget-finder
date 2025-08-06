"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowUpRight, Settings } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";
import PersonalizationModal, { type PersonalizationData } from "./PersonalizationModal";
import { trpc } from "@/utils/trpc";

const IdeaForm = () => {
  const router = useRouter();
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);

  // Use trpc mutation for generating ideas on demand
  const generateIdeasMutation = useMutation(trpc.ideas.generateOnDemand.mutationOptions({
    onSuccess: (data: any[]) => {
      toast.success(`🎉 We've found ${data.length} golden nuggets for you!`);
      // Redirect to results page with the generated idea IDs
      const ideaIds = data.map((idea: any) => idea.id).join(',');
      router.push(`/browse/results?ids=${ideaIds}`);
    },
    onError: (error: any) => {
      toast.error("❌ An unexpected error occurred while digging for ideas. Please try again.");
      console.error("Generate ideas error:", error);
    },
  }));

  const form = useForm({
    defaultValues: {
      idea: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.idea.trim()) return;
      
      // Store personalization data in sessionStorage if available
      if (personalizationData) {
        sessionStorage.setItem('personalizationData', JSON.stringify(personalizationData));
      }
      
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
                    disabled={!canSubmit || !field.state.value.trim() || generateIdeasMutation.isPending}
                  >
                    {generateIdeasMutation.isPending ? "Mining..." : "Start Mining"}
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
