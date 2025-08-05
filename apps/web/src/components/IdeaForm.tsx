"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowUpRight, Settings } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import Image from "next/image";
import { toast } from "sonner";
import PersonalizationModal, { type PersonalizationData } from "./PersonalizationModal";

const IdeaForm = () => {
  const router = useRouter();
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);

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
      
      // Redirect immediately to browse page with search query
      router.push(`/browse?q=${encodeURIComponent(value.idea)}`);
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
                    disabled={!canSubmit || !field.state.value.trim()}
                  >
                    {isSubmitting ? "Mining..." : "Start Mining"}
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
