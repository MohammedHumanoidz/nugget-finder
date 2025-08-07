/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
import { redirect } from "next/navigation";
import type { Metadata } from 'next';
import ClientFallback from "@/components/ClientFallback";
import IdeaDetailsView from "@/components/IdeaDetailsView";
import { getIdeaById, getDailyIdeas } from "@/lib/server-api";
import { getAuthenticatedIdeaById, getUserLimits } from "@/lib/server-auth";
import { getServerSession } from "@/lib/auth-server";
import type { IdeaDetailsViewProps } from "@/types/idea-details";
import NonAuthIdeaWrapper from "@/components/NonAuthIdeaWrapper";
import StructuredData from "@/components/StructuredData";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

// Helper function to ensure all required arrays exist
function transformIdeaData(idea: any): IdeaDetailsViewProps['idea'] {
  return {
    ...idea,
    tags: idea.tags || [],
    whatToBuild: idea.whatToBuild ? {
      ...idea.whatToBuild,
      coreFeaturesSummary: idea.whatToBuild.coreFeaturesSummary || [],
      userInterfaces: idea.whatToBuild.userInterfaces || [],
      keyIntegrations: idea.whatToBuild.keyIntegrations || [],
    } : {
      id: '',
      platformDescription: '',
      coreFeaturesSummary: [],
      userInterfaces: [],
      keyIntegrations: [],
      pricingStrategyBuildRecommendation: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    marketCompetition: idea.marketCompetition ? {
      ...idea.marketCompetition,
      directCompetitors: idea.marketCompetition.directCompetitors || [],
      indirectCompetitors: idea.marketCompetition.indirectCompetitors || [],
      competitorFailurePoints: idea.marketCompetition.competitorFailurePoints || [],
      unfairAdvantage: idea.marketCompetition.unfairAdvantage || [],
      moat: idea.marketCompetition.moat || [],
    } : {
      id: '',
      marketConcentrationLevel: 'MEDIUM' as const,
      marketConcentrationJustification: '',
      directCompetitors: [],
      indirectCompetitors: [],
      competitorFailurePoints: [],
      unfairAdvantage: [],
      moat: [],
      competitivePositioningScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    monetizationStrategy: idea.monetizationStrategy ? {
      ...idea.monetizationStrategy,
      revenueStreams: idea.monetizationStrategy.revenueStreams || [],
      financialProjections: idea.monetizationStrategy.financialProjections || [],
    } : {
      id: '',
      primaryModel: '',
      pricingStrategy: '',
      businessScore: 0,
      confidence: 0,
      revenueModelValidation: '',
      pricingSensitivity: '',
      revenueStreams: [],
      keyMetrics: null,
      financialProjections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    strategicPositioning: idea.strategicPositioning ? {
      ...idea.strategicPositioning,
      keyDifferentiators: idea.strategicPositioning.keyDifferentiators || [],
    } : {
      id: '',
      name: '',
      targetSegment: '',
      valueProposition: '',
      keyDifferentiators: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    executionPlan: idea.executionPlan ? {
      ...idea.executionPlan,
      keyMilestones: idea.executionPlan.keyMilestones || [],
      teamRequirements: idea.executionPlan.teamRequirements || [],
      riskFactors: idea.executionPlan.riskFactors || [],
    } : {
      id: '',
      mvpDescription: '',
      keyMilestones: [],
      resourceRequirements: '',
      teamRequirements: [],
      riskFactors: [],
      technicalRoadmap: '',
      goToMarketStrategy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tractionSignals: idea.tractionSignals ? {
      ...idea.tractionSignals,
      regulatoryChanges: idea.tractionSignals.regulatoryChanges || [],
      expertEndorsements: idea.tractionSignals.expertEndorsements || [],
      earlyAdopterSignals: idea.tractionSignals.earlyAdopterSignals || [],
    } : {
      id: '',
      waitlistCount: null,
      socialMentions: null,
      searchVolume: null,
      competitorFunding: null,
      patentActivity: null,
      regulatoryChanges: [],
      mediaAttention: null,
      expertEndorsements: [],
      earlyAdopterSignals: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    frameworkFit: idea.frameworkFit ? {
      ...idea.frameworkFit,
      jobsToBeDone: idea.frameworkFit.jobsToBeDone || [],
    } : {
      id: '',
      jobsToBeDone: [],
      blueOceanFactors: {},
      leanCanvasScore: 0,
      designThinkingStage: '',
      innovationDilemmaFit: '',
      crossingChasmStage: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}


// Generate static params for static generation
export async function generateStaticParams() {
  try {
    const response = await getDailyIdeas();
    if (!response?.ideas) return [];
    
    return response.ideas.slice(0, 10).map((idea: any) => ({
      id: idea.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

interface NuggetPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Dynamically generate metadata for this page
export async function generateMetadata({ params }: NuggetPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const idea = await getIdeaById(id);
    if (!idea) {
      return {
        title: "Startup Idea Not Found",
        description: "Explore AI startup ideas with market research and practical next steps.",
      };
    }
    const baseTitle = idea.title || "AI Startup Idea";
    const rawDesc = idea.executiveSummary || idea.description || idea.problemSolution || "Explore validated AI startup ideas with clear insights and practical steps.";
    const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;

    return {
      title: `${baseTitle} | AI Startup Idea`,
      description,
      alternates: { canonical: `/nugget/${id}` },
    };
  } catch {
    return {
      title: "AI Startup Idea",
      description: "Explore AI startup ideas with market research and practical next steps.",
    };
  }
}

// Server component with SSR and authentication
export default async function NuggetDetailPage({ params }: NuggetPageProps) {
  // Await params in Next.js 15
  const { id } = await params;
  
  try {
    console.log('[DEBUG] Page: Attempting to fetch idea', id);
    
    // Check if user is authenticated
    const session = await getServerSession();
    const isAuthenticated = !!session?.user;
    
    console.log('[DEBUG] Page: User authentication status:', { isAuthenticated });
    
    if (isAuthenticated) {
      // For authenticated users, use the existing flow with view limits
      const limits = await getUserLimits();
      console.log('[DEBUG] Page: User limits check:', {
        canView: limits?.canView,
        viewsRemaining: limits?.viewsRemaining,
        ideaId: id,
      });
      
      // If user has no views remaining and this is a new idea they haven't viewed before,
      // redirect them to pricing page immediately
      if (limits && !limits.canView && limits.viewsRemaining === 0) {
        console.log('[DEBUG] Page: User has 0 views remaining, redirecting to pricing');
        redirect('/pricing?reason=view_limit');
      }
      
      // Fetch data server-side with authentication and view limits check
      const idea = await getAuthenticatedIdeaById(id);

      if (!idea) {
        // Try client-side fallback before showing 404
        console.log('[DEBUG] Page: No server data for nugget, using client fallback');
        return (
          <div className="min-h-screen bg-background">        
            <ClientFallback type="nugget" nuggetId={id} />
          </div>
        );
      }

      console.log('[DEBUG] Page: Server data fetch successful, rendering IdeaDetailsView');

      // Transform the data to ensure all required arrays exist
      const ideaWithFullData = transformIdeaData(idea);

      // Generate structured data for SEO
      const url = `https://nuggetfinder.ai/nugget/${id}`;
      
      // Schema for an Article (the idea itself)
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": ideaWithFullData.title,
        "description": ideaWithFullData.executiveSummary || ideaWithFullData.description,
        "image": "https://nuggetfinder.ai/logo.webp",
        "author": {
          "@type": "Organization",
          "name": "Nugget Finder AI"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Nugget Finder",
          "logo": {
            "@type": "ImageObject",
            "url": "https://nuggetfinder.ai/logo.webp"
          }
        },
        "datePublished": ideaWithFullData.createdAt ? new Date(ideaWithFullData.createdAt).toISOString() : undefined,
        "dateModified": ideaWithFullData.updatedAt ? new Date(ideaWithFullData.updatedAt).toISOString() : undefined,
      };

      // Schema for a Product (the idea as a claimable item)
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": ideaWithFullData.title,
        "description": ideaWithFullData.executiveSummary || ideaWithFullData.description,
        "image": "https://nuggetfinder.ai/logo.webp",
        "sku": ideaWithFullData.id,
        "brand": {
          "@type": "Brand",
          "name": "Nugget Finder"
        },
        "offers": {
          "@type": "Offer",
          "url": url,
          "priceCurrency": "USD",
          "price": "0", // Represents "claiming" the idea
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "Nugget Finder"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": ideaWithFullData.ideaScore?.totalScore ? (ideaWithFullData.ideaScore.totalScore / 10).toFixed(1) : "4.5",
          "reviewCount": "1" // Represents the AI's single, comprehensive review
        }
      };

      return (
        <div className="min-h-screen bg-background">
          <StructuredData data={articleSchema} />
          <StructuredData data={productSchema} />
          <IdeaDetailsView idea={ideaWithFullData} />
        </div>
      );
    }
    
    // For non-authenticated users, use client-side localStorage tracking
    console.log('[DEBUG] Page: Non-authenticated user, using client-side tracking');
    return (
      <div className="min-h-screen bg-background">
        <NonAuthIdeaWrapper ideaId={id} />
      </div>
    );
  } catch (error: any) {
    console.log('[DEBUG] Page: Caught error:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.substring(0, 200),
    });

    
    // Re-throw redirect errors to let Next.js handle them properly
    if (error?.message === 'NEXT_REDIRECT') {
      console.log('[DEBUG] Page: Re-throwing NEXT_REDIRECT error');
      throw error;
    }
    
    // If view limit exceeded, redirect to pricing page
    if (error?.message === 'VIEW_LIMIT_EXCEEDED' || error?.message?.includes('VIEW_LIMIT_EXCEEDED')) {
      console.log('[DEBUG] Page: Redirecting to pricing due to view limit exceeded');
      redirect('/pricing?reason=view_limit');
    }
    
    // For other errors, fall back to client-side
    console.log('[DEBUG] Page: Using client fallback for error:', error?.message);
    return (
      <div className="min-h-screen bg-background">        
        <ClientFallback type="nugget" nuggetId={id} />
      </div>
    );
  }
}