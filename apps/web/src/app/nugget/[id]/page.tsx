/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
import { redirect } from "next/navigation";
import ClientFallback from "@/components/ClientFallback";
import IdeaDetailsView from "@/components/IdeaDetailsView";
import { generateStaticParams } from "@/lib/server-api";
import { getAuthenticatedIdeaById, getUserLimits } from "@/lib/server-auth";
import { getServerSession } from "@/lib/auth-server";
import type { IdeaDetailsViewProps } from "@/types/idea-details";
import NonAuthIdeaWrapper from "@/components/NonAuthIdeaWrapper";
import StructuredData from "@/components/StructuredData";
import type { Metadata } from "next";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

// Generate dynamic metadata for each nugget page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // Try to get idea data for metadata (simplified version for performance)
    const session = await getServerSession();
    if (session?.user) {
      const idea = await getAuthenticatedIdeaById(id);
      if (idea) {
        return {
          title: `${idea.title} | Startup Opportunity Analysis`,
          description: `${idea.narrativeHook || idea.problemSolution?.substring(0, 155) || 'Comprehensive startup idea analysis including market research, competitive landscape, and execution strategy.'}`,
          openGraph: {
            title: `${idea.title} | Nugget Finder`,
            description: idea.narrativeHook || idea.problemSolution?.substring(0, 155) || 'AI-analyzed startup opportunity with market validation',
            url: `https://nugget-finder.com/nugget/${id}`,
            type: 'article',
            images: [
              {
                url: '/logo.webp',
                width: 1200,
                height: 630,
                alt: `${idea.title} - Startup Opportunity`,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title: `${idea.title} | Nugget Finder`,
            description: idea.narrativeHook || 'AI-analyzed startup opportunity with market validation',
            images: ['/logo.webp'],
          },
          keywords: [
            'startup idea',
            'business opportunity',
            'market analysis',
            'competitive research',
            'startup validation',
            idea.title?.toLowerCase().replace(/\s+/g, ' ') || '',
            ...(idea.tags || []).map(tag => tag.toLowerCase())
          ].filter(Boolean),
        };
      }
    }
  } catch (error) {
    // Fall back to generic metadata if we can't fetch the idea
    console.log('[DEBUG] Metadata generation failed, using fallback');
  }

  // Fallback metadata
  return {
    title: 'Startup Opportunity Analysis | Nugget Finder',
    description: 'Discover comprehensive startup idea analysis including market research, competitive landscape, technical feasibility, and execution strategy powered by AI.',
    openGraph: {
      title: 'Startup Opportunity Analysis | Nugget Finder',
      description: 'AI-powered startup idea analysis with market validation and competitive research',
      url: `https://nugget-finder.com/nugget/${id}`,
      type: 'article',
    },
  };
}

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

// Generate structured data for the idea
function generateIdeaSchema(idea: any, id: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": idea.title,
    "description": idea.narrativeHook || idea.problemSolution,
    "url": `https://nugget-finder.com/nugget/${id}`,
    "dateCreated": idea.createdAt,
    "dateModified": idea.updatedAt,
    "creator": {
      "@type": "Organization",
      "name": "Nugget Finder"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Nugget Finder",
      "url": "https://nugget-finder.com"
    },
    "about": {
      "@type": "Thing",
      "name": "Startup Opportunity",
      "description": "AI-analyzed business opportunity with market validation"
    },
    "keywords": [
      "startup idea",
      "business opportunity", 
      "market analysis",
      idea.title?.toLowerCase().replace(/\s+/g, ' '),
      ...(idea.tags || []).map((tag: string) => tag.toLowerCase())
    ].filter(Boolean).join(', '),
    "mainEntity": {
      "@type": "Product",
      "name": idea.title,
      "description": idea.problemSolution,
      "category": "Business Opportunity",
      "audience": {
        "@type": "Audience",
        "audienceType": "Entrepreneurs"
      }
    }
  };
}

// Export generateStaticParams for static generation
export { generateStaticParams };

// Server component with SSR and authentication
export default async function NuggetDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

      return (
        <div className="min-h-screen bg-background">
          {/* Structured data for AI understanding */}
          <StructuredData data={generateIdeaSchema(idea, id)} />
          
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