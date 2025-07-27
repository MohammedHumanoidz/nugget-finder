import React, { useState } from 'react';
import type { IdeaDetailsViewProps, DirectCompetitor, IndirectCompetitor } from '@/types/idea-details';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const IdeaDetailsView: React.FC<IdeaDetailsViewProps> = ({ idea }) => {
  const [competitorTab, setCompetitorTab] = useState<'direct' | 'indirect'>('direct');
  const [chatMessage, setChatMessage] = useState('');

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format percentage
  const formatPercentage = (decimal: number): string => {
    return `${(decimal * 100).toFixed(1)}%`;
  };

  // Helper function to render bullet points
  const renderBulletPoints = (items: string[], emptyMessage = "Not specified") => {
    if (!items || items.length === 0) return <span className="text-muted-foreground italic">{emptyMessage}</span>;
    return (
      <ul className="space-y-1 pl-4">
        {items.map((item, index) => (
          <li key={index} className="text-muted-foreground text-sm">• {item}</li>
        ))}
      </ul>
    );
  };

  // Prepare radar chart data
  const radarData = [
    { subject: 'Problem Severity', value: idea.ideaScore.problemSeverity },
    { subject: 'Founder Market Fit', value: idea.ideaScore.founderMarketFit },
    { subject: 'Technical Feasibility', value: idea.ideaScore.technicalFeasibility },
    { subject: 'Monetization Potential', value: idea.ideaScore.monetizationPotential },
    { subject: 'Urgency Score', value: idea.ideaScore.urgencyScore },
    { subject: 'Market Timing', value: idea.ideaScore.marketTimingScore },
    { subject: 'Execution Difficulty', value: 10 - idea.ideaScore.executionDifficulty }, // Invert for better visualization
    { subject: 'Moat Strength', value: idea.ideaScore.moatStrength },
    { subject: 'Regulatory Risk', value: 10 - idea.ideaScore.regulatoryRisk }, // Invert for better visualization
  ];

  // Prepare financial projections bar chart data
  const financialData = idea.monetizationStrategy.financialProjections.map(proj => ({
    year: `Year ${proj.year}`,
    revenue: proj.revenue / 1000000, // Convert to millions
    costs: proj.costs / 1000000,
    profit: (proj.revenue - proj.costs) / 1000000,
  }));

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle chat message submission here
    console.log('Chat message:', chatMessage);
    setChatMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="font-semibold text-lg text-foreground">NuggetFinder.io</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Prospect</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Claims</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Vault</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Account</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <a href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">← Back to Nuggets</a>
      </div>

      {/* Main Title Area */}
      <div className="max-w-7xl mx-auto px-4 pb-8 text-center">
        <h1 className="text-xl font-bold text-destructive mb-6">CHECK OUT THIS NUGGET ❤️‍🔥</h1>
        <h2 className="text-4xl font-bold text-foreground mb-4">{idea.title}</h2>
        <div className="text-lg italic text-primary mb-6 border-b-2 border-border pb-4 max-w-4xl mx-auto">
          "{idea.narrativeHook}"
        </div>
        <div className="text-base text-muted-foreground max-w-4xl mx-auto mb-8 text-left">
          {idea.description}
        </div>
        
        {/* Badges */}
        <div className="flex justify-center gap-3 flex-wrap">
          <span className="bg-purple-100 border border-purple-300 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">💎 High Purity</span>
          <span className="bg-orange-100 border border-orange-300 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">🔥 Prime Claim</span>
          <span className="bg-green-100 border border-green-300 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">⛏️ Ready to Mine</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex gap-8 items-start">
          {/* Left Column */}
          <div className="flex-2 min-w-0 space-y-8">
            
            {/* Prospector's Brief */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">📖 Prospector's Brief</h3>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-foreground font-semibold mb-2">Problem Statement:</h4>
                  <p className="text-muted-foreground">{idea.problemStatement}</p>
                </div>
                <div>
                  <h4 className="text-foreground font-semibold mb-2">Problem Solution:</h4>
                  <p className="text-muted-foreground">{idea.problemSolution}</p>
                </div>
              </div>
            </div>

            {/* The Claim (Why Now?) */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">🌟 The Claim (Why Now?)</h3>
              <div className="p-6 space-y-4">
                <h4 className="text-foreground font-semibold">{idea.whyNow.title}</h4>
                <div className="bg-muted/50 border border-border p-4 rounded-lg flex justify-between items-center">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-semibold">
                    {idea.whyNow.catalystType.replace(/_/g, ' ')}
                  </span>
                  <div className="flex gap-4 text-sm font-medium">
                    <span>Strength: {idea.whyNow.trendStrength}/10</span>
                    <span>Urgency: {idea.whyNow.timingUrgency}/10</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{idea.whyNow.description}</p>
                {idea.whyNow.supportingData && idea.whyNow.supportingData.length > 0 && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Supporting Evidence:</h4>
                    {renderBulletPoints(idea.whyNow.supportingData)}
                  </div>
                )}
              </div>
            </div>

            {/* The Vein (Market Gap) */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">🗺️ The Vein (Market Gap)</h3>
              <div className="p-6 space-y-4">
                <h4 className="text-foreground font-semibold">Title: {idea.marketGap.title}</h4>
                <p className="text-muted-foreground"><strong>Description:</strong> {idea.marketGap.description}</p>
                <p className="text-muted-foreground"><strong>Impact:</strong> {idea.marketGap.impact}</p>
                <p className="text-muted-foreground"><strong>Target:</strong> {idea.marketGap.target}</p>
                <p className="text-muted-foreground"><strong>Opportunity:</strong> {idea.marketGap.opportunity}</p>
              </div>
            </div>

            {/* Competitive Landscape */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">⚔️ Competitive Landscape</h3>
              <div className="p-6 space-y-6">
                <div className="bg-muted/50 border border-border p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-foreground font-semibold">Market Concentration</h4>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      idea.marketCompetition.marketConcentrationLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                      idea.marketCompetition.marketConcentrationLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {idea.marketCompetition.marketConcentrationLevel}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{idea.marketCompetition.marketConcentrationJustification}</p>
                </div>

                {/* Competitor Tabs */}
                <Tabs value={competitorTab} onValueChange={(value) => setCompetitorTab(value as 'direct' | 'indirect')} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="direct" className="text-foreground">
                      Direct Competitors ({idea.marketCompetition.directCompetitors.length})
                    </TabsTrigger>
                    <TabsTrigger value="indirect" className="text-foreground">
                      Indirect Competitors ({idea.marketCompetition.indirectCompetitors.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="direct" className="space-y-3">
                    {idea.marketCompetition.directCompetitors.map((competitor: DirectCompetitor, index: number) => (
                      <div key={index} className="bg-muted/30 border-l-4 border-border p-4 rounded-lg">
                        <h5 className="text-foreground font-semibold mb-2">• {competitor.name}</h5>
                        <p className="text-muted-foreground text-sm mb-2">{competitor.justification}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {competitor.strengths && competitor.strengths.length > 0 && (
                            <div>
                              <span className="text-green-600 font-medium text-xs">Strengths:</span>
                              {renderBulletPoints(competitor.strengths)}
                            </div>
                          )}
                          {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                            <div>
                              <span className="text-red-600 font-medium text-xs">Weaknesses:</span>
                              {renderBulletPoints(competitor.weaknesses)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="indirect" className="space-y-3">
                    {idea.marketCompetition.indirectCompetitors.map((competitor: IndirectCompetitor, index: number) => (
                      <div key={index} className="bg-muted/30 border-l-4 border-border p-4 rounded-lg">
                        <h5 className="text-foreground font-semibold mb-2">• {competitor.name}</h5>
                        <p className="text-muted-foreground text-sm mb-2">{competitor.justification}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {competitor.strengths && competitor.strengths.length > 0 && (
                            <div>
                              <span className="text-green-600 font-medium text-xs">Strengths:</span>
                              {renderBulletPoints(competitor.strengths)}
                            </div>
                          )}
                          {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                            <div>
                              <span className="text-red-600 font-medium text-xs">Weaknesses:</span>
                              {renderBulletPoints(competitor.weaknesses)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                {/* Competitor Failure Points & Advantages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {idea.marketCompetition.competitorFailurePoints && idea.marketCompetition.competitorFailurePoints.length > 0 && (
                    <div>
                      <h4 className="text-foreground font-semibold mb-2">Competitor Failure Points:</h4>
                      {renderBulletPoints(idea.marketCompetition.competitorFailurePoints)}
                    </div>
                  )}
                  {idea.marketCompetition.unfairAdvantage && idea.marketCompetition.unfairAdvantage.length > 0 && (
                    <div>
                      <h4 className="text-foreground font-semibold mb-2">Our Unfair Advantages:</h4>
                      {renderBulletPoints(idea.marketCompetition.unfairAdvantage)}
                    </div>
                  )}
                </div>

                {idea.marketCompetition.moat && idea.marketCompetition.moat.length > 0 && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Moat:</h4>
                    {renderBulletPoints(idea.marketCompetition.moat)}
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Model */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">💰 Revenue Model</h3>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm"><strong>Primary Model:</strong> {idea.monetizationStrategy.primaryModel}</p>
                  <p className="text-sm"><strong>Pricing Strategy:</strong> {idea.monetizationStrategy.pricingStrategy}</p>
                  <p className="text-sm"><strong>Revenue Model Validation:</strong> {idea.monetizationStrategy.revenueModelValidation}</p>
                  <p className="text-sm"><strong>Pricing Sensitivity:</strong> {idea.monetizationStrategy.pricingSensitivity}</p>
                </div>
                
                <div className="flex gap-8 text-sm">
                  <span><strong>Business Score:</strong> {idea.monetizationStrategy.businessScore}/10</span>
                  <span><strong>Confidence:</strong> {idea.monetizationStrategy.confidence}/10</span>
                </div>

                {/* Revenue Streams */}
                {idea.monetizationStrategy.revenueStreams && idea.monetizationStrategy.revenueStreams.length > 0 && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-3">Revenue Streams:</h4>
                    <div className="space-y-3">
                      {idea.monetizationStrategy.revenueStreams.map((stream, index) => (
                        <div key={index} className="bg-muted/50 border border-border p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <strong className="text-green-600">• {stream.name} ({stream.percentage}%)</strong>
                              <p className="text-muted-foreground text-sm">{stream.description}</p>
                            </div>
                            <div className="w-20 h-2 bg-secondary rounded-full">
                              <div 
                                className="h-2 bg-primary rounded-full" 
                                style={{ width: `${stream.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                {idea.monetizationStrategy.keyMetrics && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-3">Key Metrics:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>• <strong>LTV:</strong> {formatCurrency(idea.monetizationStrategy.keyMetrics.ltv)}</div>
                      <div>• <strong>CAC:</strong> {formatCurrency(idea.monetizationStrategy.keyMetrics.cac)}</div>
                      <div>• <strong>LTV:CAC Ratio:</strong> {idea.monetizationStrategy.keyMetrics.ltvCacRatio}:1</div>
                      <div>• <strong>Payback Period:</strong> {idea.monetizationStrategy.keyMetrics.paybackPeriod} months</div>
                      <div>• <strong>Runway:</strong> {idea.monetizationStrategy.keyMetrics.runway} months</div>
                      <div>• <strong>Break-Even Point:</strong> {idea.monetizationStrategy.keyMetrics.breakEvenPoint}</div>
                    </div>
                    
                    <div className="border-t border-border pt-4 space-y-2 text-sm text-muted-foreground">
                      <p><strong>LTV:</strong> {idea.monetizationStrategy.keyMetrics.ltvDescription}</p>
                      <p><strong>CAC:</strong> {idea.monetizationStrategy.keyMetrics.cacDescription}</p>
                      <p><strong>LTV:CAC Ratio:</strong> {idea.monetizationStrategy.keyMetrics.ltvCacRatioDescription}</p>
                      <p><strong>Payback Period:</strong> {idea.monetizationStrategy.keyMetrics.paybackPeriodDescription}</p>
                      <p><strong>Runway:</strong> {idea.monetizationStrategy.keyMetrics.runwayDescription}</p>
                      <p><strong>Break-Even Point:</strong> {idea.monetizationStrategy.keyMetrics.breakEvenPointDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Projections Bar Chart */}
            {idea.monetizationStrategy.financialProjections && idea.monetizationStrategy.financialProjections.length > 0 && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">📈 Financial Projections (3 Years)</h3>
                <div className="p-6">
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "#ea580c" },
                      costs: { label: "Costs", color: "#fb923c" },
                      profit: { label: "Profit", color: "#fdba74" },
                    }}
                    className="h-[400px]"
                  >
                    <BarChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis label={{ value: 'Amount (Millions $)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="#ea580c" name="Revenue" />
                      <Bar dataKey="costs" fill="#fb923c" name="Costs" />
                      <Bar dataKey="profit" fill="#fdba74" name="Profit" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            )}

            {/* Execution & Validation */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold">🛠️ Execution & Validation</h3>
              <div className="p-6 space-y-6">
                {idea.executionPlan?.mvpDescription && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Execution Plan:</h4>
                    <p className="text-muted-foreground">{idea.executionPlan.mvpDescription}</p>
                  </div>
                )}

                {idea.tractionSignals?.earlyAdopterSignals && idea.tractionSignals.earlyAdopterSignals.length > 0 && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Traction Signals:</h4>
                    {renderBulletPoints(idea.tractionSignals.earlyAdopterSignals)}
                  </div>
                )}

                {idea.frameworkFit?.innovationDilemmaFit && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Framework Fit:</h4>
                    <p className="text-muted-foreground">{idea.frameworkFit.innovationDilemmaFit}</p>
                  </div>
                )}

                {idea.tags && idea.tags.length > 0 && (
                  <div>
                    <h4 className="text-foreground font-semibold mb-2">Tags:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {idea.tags.map((tag, index) => (
                        <span key={index} className="bg-muted text-primary border border-border px-3 py-1 rounded-full text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat-style Interrogate Section */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-6 py-4 text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                💬 Interrogate this Nugget
              </h3>
              <div className="p-6">
                <div className="bg-muted/30 rounded-lg p-4 mb-4 min-h-[200px] flex flex-col">
                  <div className="flex-1 space-y-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg max-w-xs">
                      <p className="text-sm">Hi! I'm your AI assistant for this nugget. Ask me anything about the market opportunity, risks, competitive analysis, or implementation details.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleChatSubmit} className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask me about this nugget..."
                      className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button type="submit" className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send
                    </Button>
                  </form>
                  
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatMessage("What are the main risks with this idea?")}
                      className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-full transition-colors h-auto"
                    >
                      Show me risks
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatMessage("What's the market size for this opportunity?")}
                      className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-full transition-colors h-auto"
                    >
                      Market size
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatMessage("How do I validate this idea quickly?")}
                      className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-full transition-colors h-auto"
                    >
                      Validation strategy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="flex-1 max-w-sm space-y-6 sticky top-24">
            
            {/* Assay Report */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-4 py-3 text-lg font-semibold">📊 Summarized Report</h3>
              <div className="p-4 space-y-4">
                <div className="bg-muted/50 border border-border p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-muted-foreground mb-3">
                    <span>Opportunity</span>
                    <span>Feasibility</span>
                    <span>Defensibility</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-green-600">
                    <span>{idea.ideaScore.monetizationPotential}/10</span>
                    <span>{idea.ideaScore.technicalFeasibility}/10</span>
                    <span>{idea.ideaScore.moatStrength}/10</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>💡</span>
                    <span className="text-sm">Innovation Level: {idea.innovationLevel}/10</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>⏱️</span>
                    <span className="text-sm">Time to Market: {idea.timeToMarket} months</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>🔥</span>
                    <span className="text-sm">Urgency Level: {idea.urgencyLevel}/10</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>🏗️</span>
                    <span className="text-sm">Execution Complexity: {idea.executionComplexity}/10</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded">
                    <span>✅</span>
                    <span className="text-sm">Confidence Score: {idea.confidenceScore}/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Position */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-4 py-3 text-lg font-semibold">🏆 Strategic Position</h3>
              <div className="p-4 space-y-3">
                <h4 className="text-foreground font-semibold">{idea.strategicPositioning.name}</h4>
                <p className="text-sm"><strong>Target Segment:</strong> {idea.strategicPositioning.targetSegment}</p>
                <p className="text-sm"><strong>Value Proposition:</strong> {idea.strategicPositioning.valueProposition}</p>
              </div>
            </div>

            {/* Key Differentiators */}
            {idea.strategicPositioning.keyDifferentiators && idea.strategicPositioning.keyDifferentiators.length > 0 && (
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <h3 className="bg-muted/50 text-foreground border-b border-border px-4 py-3 text-lg font-semibold">✨ Key Differentiators</h3>
                <div className="p-4">
                  {renderBulletPoints(idea.strategicPositioning.keyDifferentiators)}
                </div>
              </div>
            )}

            {/* Idea Score Radar Chart */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <h3 className="bg-muted/50 text-foreground border-b border-border px-4 py-3 text-lg font-semibold">📊 IDEA SCORE RADAR CHART</h3>
              <div className="p-4 space-y-4">
                <div className="text-center bg-muted/50 border border-border text-primary p-3 rounded-lg">
                  <strong>Overall Idea Score: {idea.ideaScore.totalScore}/100</strong>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Problem Severity:</span><span>{idea.ideaScore.problemSeverity}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Founder Market Fit:</span><span>{idea.ideaScore.founderMarketFit}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Technical Feasibility:</span><span>{idea.ideaScore.technicalFeasibility}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Monetization Potential:</span><span>{idea.ideaScore.monetizationPotential}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Urgency Score:</span><span>{idea.ideaScore.urgencyScore}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Market Timing Score:</span><span>{idea.ideaScore.marketTimingScore}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Execution Difficulty:</span><span>{idea.ideaScore.executionDifficulty}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Moat Strength:</span><span>{idea.ideaScore.moatStrength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regulatory Risk:</span><span>{idea.ideaScore.regulatoryRisk}</span>
                  </div>
                </div>
                
                <div className="bg-muted/50 border border-border rounded-lg min-h-[300px]">
                  <ChartContainer
                    config={{
                      score: { label: "Score", color: "#ea580c" },
                    }}
                    className="h-[280px]"
                  >
                    <RadarChart data={radarData} className='w-fit scale-90 -ml-20'>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 8 }} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#ea580c"
                        fill="#ea580c"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        className=''
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailsView;