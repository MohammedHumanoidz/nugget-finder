export const GENERATION_STEPS = {
  INITIALIZING: {
    step: "Initializing",
    message: "Preparing to generate your business ideas...",
    imageState: "confused"
  },
  STARTING_RESEARCH: {
    step: "Starting Research", 
    message: "Beginning comprehensive market analysis...",
    imageState: "confused"
  },
  RESEARCH_DIRECTION: {
    step: "Research Direction",
    message: "Setting research direction based on your prompt...",
    imageState: "confused"
  },
  TREND_RESEARCH: {
    step: "Trend Research",
    message: "Analyzing market trends and opportunities...",
    imageState: "digging"
  },
  PROBLEM_ANALYSIS: {
    step: "Problem Analysis",
    message: "Uncovering critical market gaps and pain points...",
    imageState: "digging"
  },
  COMPETITIVE_ANALYSIS: {
    step: "Competitive Analysis",
    message: "Mapping competitive landscape and strategic positioning...",
    imageState: "digging"
  },
  MONETIZATION_STRATEGY: {
    step: "Monetization Strategy",
    message: "Architecting sustainable monetization strategies...",
    imageState: "digging"
  },
  TECHNICAL_PLANNING: {
    step: "Technical Planning",
    message: "Blueprinting technical implementation and MVP roadmap...",
    imageState: "digging"
  },
  IDEA_SYNTHESIS: {
    step: "Idea Synthesis",
    message: "Weaving insights into breakthrough business opportunities...",
    imageState: "happy"
  },
  CRITICAL_REVIEW: {
    step: "Critical Review",
    message: "Examining opportunity through expert critical lens...",
    imageState: "happy"
  },
  FINAL_REFINEMENT: {
    step: "Final Refinement",
    message: "Crafting your final breakthrough opportunity...",
    imageState: "happy"
  },
  SAVING_RESULTS: {
    step: "Saving Results",
    message: "Securing golden nugget in your treasure vault...",
    imageState: "found"
  },
  COMPLETE: {
    step: "Complete",
    message: "🎉 Discovery complete! Found amazing business nuggets for you!",
    imageState: "found"
  },
  FAILED: {
    step: "Failed",
    message: "Failed to generate ideas. Please try again.",
    imageState: "confused"
  }
} as const;

// Helper function to get step with idea number
export const getStepForIdeaGeneration = (ideaNumber: number, totalIdeas: number) => ({
  step: `Generating idea ${ideaNumber}/${totalIdeas}`,
  message: `Working on your ${ideaNumber === 1 ? 'first' : ideaNumber === 2 ? 'second' : 'third'} business opportunity...`,
  imageState: "confused" as const
});

export const getCompletionStep = (generatedCount: number) => ({
  step: "Complete",
  message: `🎉 Discovery complete! Found ${generatedCount} golden business nuggets for you!`,
  imageState: "found" as const
}); 