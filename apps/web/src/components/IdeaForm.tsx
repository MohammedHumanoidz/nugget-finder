"use client";

import React from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import Image from "next/image";

const IdeaForm = () => {
  const form = useForm({
    defaultValues: {
      idea: "",
    },
    onSubmit: async ({ value }) => {
      // Log the form data - replace with actual backend call later
      console.log("Form submitted:", value);
    },
  });

  const defaultIdeas = [
    "I want to build a new social media platform",
    "I want to create a new AI assistant",
    "I want to build a new fitness tracker",
  ];

  const handleDefaultIdeaClick = (idea: string) => {
    // Get the current form field and update its value
    form.setFieldValue("idea", idea);
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
                placeholder="What should we mine today?"
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

      {/* Default Ideas Section */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {defaultIdeas.map((idea) => (
          <Button
            key={idea}
            variant="outline"
            onClick={() => handleDefaultIdeaClick(idea)}
            className="h-auto justify-start whitespace-normal rounded-full p-3 text-left text-muted-foreground text-sm backdrop-blur-xl hover:bg-primary/10"
          >
            {idea}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default IdeaForm;
