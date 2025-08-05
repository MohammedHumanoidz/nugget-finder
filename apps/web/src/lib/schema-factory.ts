// Schema factory for consistent structured data generation across Nugget Finder

export interface IdeaData {
  id: string;
  title: string;
  narrativeHook?: string;
  problemSolution?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags?: string[];
  ideaScore?: {
    overallScore: number;
    marketSize?: number;
    technicalFeasibility?: number;
    competitiveLandscape?: number;
  };
  marketOpportunity?: {
    marketSize?: string;
    targetAudience?: string;
  };
  monetizationStrategy?: {
    primaryModel?: string;
    revenueStreams?: any[];
  };
}

export class SchemaFactory {
  private static baseUrl = 'https://nuggetfinder.ai';

  // Generate Article schema for individual nuggets
  static generateIdeaSchema(idea: IdeaData): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": idea.title,
      "description": idea.narrativeHook || idea.problemSolution || `Comprehensive startup analysis for ${idea.title}`,
      "url": `${this.baseUrl}/nugget/${idea.id}`,
      "dateCreated": new Date(idea.createdAt).toISOString(),
      "dateModified": new Date(idea.updatedAt).toISOString(),
      "datePublished": new Date(idea.createdAt).toISOString(),
      "author": {
        "@type": "Organization",
        "name": "Nugget Finder AI",
        "url": this.baseUrl,
        "description": "AI-powered startup idea generation and market analysis platform"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Nugget Finder",
        "url": this.baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${this.baseUrl}/logo.webp`,
          "width": 512,
          "height": 512
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${this.baseUrl}/nugget/${idea.id}`
      },
      "about": [
        {
          "@type": "Thing",
          "name": "Startup Opportunity",
          "description": "AI-analyzed business opportunity with market validation and competitive research"
        },
        {
          "@type": "Thing", 
          "name": "Entrepreneurship",
          "description": "Business idea development and market analysis"
        }
      ],
      "keywords": [
        "startup idea",
        "business opportunity",
        "market analysis",
        "entrepreneurship",
        idea.title?.toLowerCase().replace(/\s+/g, ' '),
        ...(idea.tags || []).map(tag => tag.toLowerCase())
      ].filter(Boolean).join(', '),
      "articleSection": "Business Intelligence",
      "articleBody": this.generateArticleBody(idea),
      "mentions": this.generateMentions(idea),
      "potentialAction": {
        "@type": "ReadAction",
        "target": `${this.baseUrl}/nugget/${idea.id}`,
        "name": "Read Startup Analysis"
      }
    };
  }

  // Generate Product schema for business opportunities
  static generateProductSchema(idea: IdeaData): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": idea.title,
      "description": idea.problemSolution || idea.narrativeHook || `Startup opportunity: ${idea.title}`,
      "url": `${this.baseUrl}/nugget/${idea.id}`,
      "category": "Business Opportunity",
      "brand": {
        "@type": "Brand",
        "name": "Nugget Finder"
      },
      "manufacturer": {
        "@type": "Organization",
        "name": "Nugget Finder AI",
        "url": this.baseUrl
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Entrepreneurs, Investors, Product Managers",
        "geographicArea": "Worldwide"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "description": "Free access to startup idea analysis with premium features available",
        "seller": {
          "@type": "Organization",
          "name": "Nugget Finder"
        }
      },
      "review": idea.ideaScore ? {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": idea.ideaScore.overallScore,
          "bestRating": 10,
          "worstRating": 1
        },
        "author": {
          "@type": "Organization",
          "name": "Nugget Finder AI"
        },
        "reviewBody": `AI-generated analysis with overall score of ${idea.ideaScore.overallScore}/10 based on market size, technical feasibility, and competitive landscape.`
      } : undefined,
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Market Analysis",
          "value": "Comprehensive competitive research and market sizing"
        },
        {
          "@type": "PropertyValue", 
          "name": "Technical Feasibility",
          "value": "AI-assessed development complexity and requirements"
        },
        {
          "@type": "PropertyValue",
          "name": "Business Model",
          "value": idea.monetizationStrategy?.primaryModel || "Multiple revenue stream opportunities"
        }
      ].filter(Boolean)
    };
  }

  // Generate HowTo schema for execution guidance
  static generateHowToSchema(idea: IdeaData): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to Build ${idea.title}`,
      "description": `Step-by-step guide to developing and launching ${idea.title} as a startup venture`,
      "url": `${this.baseUrl}/nugget/${idea.id}`,
      "image": `${this.baseUrl}/logo.webp`,
      "totalTime": "P3M", // 3 months typical startup development
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "10000"
      },
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Market Research"
        },
        {
          "@type": "HowToSupply", 
          "name": "Technical Development"
        },
        {
          "@type": "HowToSupply",
          "name": "Business Strategy"
        }
      ],
      "tool": [
        {
          "@type": "HowToTool",
          "name": "Nugget Finder Platform"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "name": "Market Validation",
          "text": "Validate market demand and analyze competitive landscape using provided research",
          "url": `${this.baseUrl}/nugget/${idea.id}#market-analysis`
        },
        {
          "@type": "HowToStep",
          "name": "Technical Planning", 
          "text": "Review technical requirements and development roadmap",
          "url": `${this.baseUrl}/nugget/${idea.id}#technical-plan`
        },
        {
          "@type": "HowToStep",
          "name": "Business Model Implementation",
          "text": "Implement recommended monetization strategy and revenue streams",
          "url": `${this.baseUrl}/nugget/${idea.id}#business-model`
        }
      ]
    };
  }

  // Generate Organization schema with enhanced service offerings
  static generateEnhancedOrganizationSchema(): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Nugget Finder",
      "alternateName": ["NuggetFinder", "Nugget Finder AI"],
      "description": "AI-powered platform for discovering and validating startup ideas through intelligent market analysis and trend detection",
      "url": this.baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${this.baseUrl}/logo.webp`,
        "width": 512,
        "height": 512
      },
      "foundingDate": "2024",
      "industry": ["Technology", "Artificial Intelligence", "Market Research", "Business Intelligence"],
      "serviceArea": {
        "@type": "Place",
        "name": "Worldwide"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Startup Intelligence Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI-Powered Idea Generation",
              "description": "Daily generation of validated startup opportunities across technology sectors",
              "serviceType": "Business Intelligence"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Market Analysis & Validation",
              "description": "Comprehensive competitive research and market sizing for business opportunities",
              "serviceType": "Market Research"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Trend Intelligence Platform",
              "description": "Real-time monitoring of emerging technology and market trends with predictive insights",
              "serviceType": "Business Analytics"
            }
          }
        ]
      },
      "knowsAbout": [
        "Startup Development",
        "Market Analysis", 
        "Competitive Research",
        "Business Model Innovation",
        "Technology Trends",
        "Entrepreneurship",
        "AI-Powered Analytics",
        "Venture Capital Intelligence"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "url": `${this.baseUrl}/contact`
      },
      "sameAs": [
        "https://twitter.com/nuggetfinder",
        "https://github.com/nuggetfinder",
        "https://linkedin.com/company/nuggetfinder"
      ]
    };
  }

  // Helper method to generate article body content
  private static generateArticleBody(idea: IdeaData): string {
    const sections = [
      `**Startup Opportunity: ${idea.title}**`,
      idea.narrativeHook ? `Market Context: ${idea.narrativeHook}` : '',
      idea.problemSolution ? `Problem & Solution: ${idea.problemSolution}` : '',
      idea.ideaScore ? `AI Analysis Score: ${idea.ideaScore.overallScore}/10` : '',
      'This comprehensive startup analysis includes market validation, competitive research, technical feasibility assessment, and execution roadmap.'
    ].filter(Boolean);

    return sections.join('\n\n');
  }

  // Helper method to generate mentions for interconnected concepts
  private static generateMentions(idea: IdeaData): Array<Record<string, unknown>> {
    const mentions = [
      {
        "@type": "Thing",
        "name": "Market Validation",
        "description": "Process of testing business concept viability"
      },
      {
        "@type": "Thing",
        "name": "Competitive Analysis", 
        "description": "Research and assessment of market competition"
      }
    ];

    if (idea.tags && idea.tags.length > 0) {
      idea.tags.forEach(tag => {
        mentions.push({
          "@type": "Thing",
          "name": tag,
          "description": `Technology or market segment: ${tag}`
        });
      });
    }

    return mentions;
  }
} 