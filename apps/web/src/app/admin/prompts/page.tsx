"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define all the agents and their prompt structures
const AGENTS = [
  { 
    key: 'TrendResearchAgent', 
    name: 'Trend Research Agent',
    prompts: ['systemPrompt', 'userPrompt']
  },
  { 
    key: 'ProblemGapAgent', 
    name: 'Problem Gap Agent',
    prompts: ['systemPrompt']
  },
  { 
    key: 'CompetitiveIntelligenceAgent', 
    name: 'Competitive Intelligence Agent',
    prompts: ['systemPrompt']
  },
  { 
    key: 'MonetizationAgent', 
    name: 'Monetization Agent',
    prompts: ['systemPrompt']
  },
  { 
    key: 'WhatToBuildAgent', 
    name: 'What To Build Agent',
    prompts: ['systemPrompt']
  },
  { 
    key: 'IdeaSynthesisAgent', 
    name: 'Idea Synthesis Agent',
    prompts: ['trendArchitectPrompt']
  },
  { 
    key: 'CriticAgent', 
    name: 'Critic Agent',
    prompts: ['systemPrompt']
  },
  { 
    key: 'MasterResearchDirector', 
    name: 'Master Research Director',
    prompts: ['systemPrompt']
  }
];

type AgentPrompts = Record<string, Record<string, string>>; // agentName -> promptKey -> content

const getPromptDisplayName = (promptKey: string) => {
  const names = {
    'systemPrompt': 'System Prompt',
    'userPrompt': 'User Prompt',
    'trendArchitectPrompt': 'System Prompt'
  };
  return names[promptKey as keyof typeof names] || promptKey;
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<AgentPrompts>({});
  const [originalPrompts, setOriginalPrompts] = useState<AgentPrompts>({});
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [isTestingPrompts, setIsTestingPrompts] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<any>(null);
  const router = useRouter();

  // Query to get all prompts
  const { data: promptsData, isLoading, refetch } = useQuery(trpc.admin.getPrompts.queryOptions());

  // Mutation to update individual prompts
  const updatePromptMutation = useMutation(trpc.admin.updatePrompt.mutationOptions({
    onSuccess: (_, variables) => {
      toast.success('Prompt updated successfully');
      const key = `${variables.agentName}:${variables.promptKey}`;
      setSavingStates(prev => ({ ...prev, [key]: false }));
      refetch();
    },
    onError: (error: any, variables) => {
      toast.error(`Failed to update prompt: ${error.message}`);
      const key = `${variables.agentName}:${variables.promptKey}`;
      setSavingStates(prev => ({ ...prev, [key]: false }));
    }
  }));

  // Mutation to test prompt generation
  const testPromptMutation = useMutation(trpc.admin.testPromptGeneration.mutationOptions({
    onSuccess: (data: any) => {
      setIsTestingPrompts(false);
      if (data.success) {
        setGeneratedIdea(data.idea);
        toast.success(`Test idea generated successfully! "${data.idea?.title}"`);
      } else {
        toast.error(data.message);
        setGeneratedIdea(null);
      }
    },
    onError: (error: any) => {
      setIsTestingPrompts(false);
      setGeneratedIdea(null);
      toast.error(`Failed to test prompts: ${error.message}`);
    }
  }));

  // Initialize prompts when data loads
  useEffect(() => {
    if (promptsData) {
      const promptMap: AgentPrompts = {};
      
      // Initialize structure
      AGENTS.forEach(agent => {
        promptMap[agent.key] = {};
        agent.prompts.forEach(promptKey => {
          promptMap[agent.key][promptKey] = '';
        });
      });
      
      // Fill with actual data
      promptsData.forEach((prompt: any) => {
        if (promptMap[prompt.agentName]) {
          promptMap[prompt.agentName][prompt.promptKey] = prompt.promptContent;
        }
      });
      
      setPrompts(promptMap);
      setOriginalPrompts(JSON.parse(JSON.stringify(promptMap)));
    }
  }, [promptsData]);

  const handlePromptChange = (agentKey: string, promptKey: string, value: string) => {
    setPrompts(prev => ({
      ...prev,
      [agentKey]: {
        ...prev[agentKey],
        [promptKey]: value
      }
    }));
  };

  const handleSave = async (agentKey: string, promptKey: string) => {
    const promptContent = prompts[agentKey]?.[promptKey];
    if (!promptContent?.trim()) {
      toast.error('Prompt cannot be empty');
      return;
    }

    const saveKey = `${agentKey}:${promptKey}`;
    setSavingStates(prev => ({ ...prev, [saveKey]: true }));

    // Find existing prompt entry
    const existingPrompt = promptsData?.find((p: any) => 
      p.agentName === agentKey && p.promptKey === promptKey
    );

    if (existingPrompt) {
      // Update existing prompt
      updatePromptMutation.mutate({
        id: existingPrompt.id,
        promptContent: promptContent
      });
    } else {
      // Create new prompt
      updatePromptMutation.mutate({
        agentName: agentKey,
        promptKey: promptKey,
        promptContent: promptContent
      });
    }
  };

  const hasChanges = (agentKey: string, promptKey: string) => {
    return prompts[agentKey]?.[promptKey] !== originalPrompts[agentKey]?.[promptKey];
  };

  const handleTestPrompts = () => {
    setIsTestingPrompts(true);
    setGeneratedIdea(null); // Clear any previous results
    testPromptMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p>Loading prompts...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Prompts</h1>
          <p className="text-muted-foreground">
            Configure the system and user prompts for each AI agent to customize idea generation behavior
          </p>
        </div>
        <div className='flex flex-col gap-2'>
        {
          isTestingPrompts && (
            <div className='bg-emerald-500 text-white px-4 py-2 rounded-md'>
              <p>This might take a while so please dont close the tab. Estimated time: 5-10 minutes</p>
            </div>
          )
        }
        <Button 
          onClick={handleTestPrompts}
          disabled={isTestingPrompts}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2"
        >
          {isTestingPrompts ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            '🧪 Test Prompts'
          )}
        </Button>
        </div>
      </div>

      {/* Generated Idea Display */}
      {generatedIdea && (
        <Card className="mt-6 border-primary bg-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className=" flex items-center gap-2">
                🎉 Test Generation Results
              </CardTitle>
              <div className='flex items-center gap-2'>
              <Button variant="ghost" size="sm" onClick={() => {
                router.push(`/nugget/${generatedIdea.id}`);
              }}>
                <ArrowUpRight className="h-4 w-4" /> View Nugget
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGeneratedIdea(null)}
                className=""
              >
                ✕ Close
              </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">{generatedIdea.title}</h3>
              <p className="text-sm text-primary/75 mb-3">{generatedIdea.executiveSummary}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-primary mb-1">📖 Description</h4>
                  <p className="text-sm text-primary/75 line-clamp-4">{generatedIdea.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-primary mb-1">🎯 Problem & Solution</h4>
                  <p className="text-sm text-primary/75 line-clamp-3">{generatedIdea.problemSolution}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-1">⚡ Narrative Hook</h4>
                  <p className="text-sm text-primary/75">{generatedIdea.narrativeHook}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <div className="bg-primary/10 px-2 py-1 rounded text-xs text-primary">
                    💡 Innovation: {generatedIdea.innovationLevel}/10
                  </div>
                  <div className="bg-primary/10 px-2 py-1 rounded text-xs text-primary">
                    ⏱️ Time to Market: {generatedIdea.timeToMarket}/10
                  </div>
                  <div className="bg-primary/10 px-2 py-1 rounded text-xs text-primary">
                    🎯 Confidence: {generatedIdea.confidenceScore}/10
                  </div>
                  <div className="bg-primary/10 px-2 py-1 rounded text-xs text-primary">
                    🚨 Urgency: {generatedIdea.urgencyLevel}/10
                  </div>
                  <div className="bg-primary/10 px-2 py-1 rounded text-xs text-primary">
                    🔧 Complexity: {generatedIdea.executionComplexity}/10
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-primary mb-1">🏷️ Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {generatedIdea.tags?.map((tag: string, index: number) => (
                      <span key={index.toString()} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-1">🔍 SEO Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {generatedIdea.targetKeywords?.slice(0, 5).map((keyword: string, index: number) => (
                      <span key={index.toString()} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                    {generatedIdea.targetKeywords?.length > 5 && (
                      <span className="text-emerald-600 text-xs">+{generatedIdea.targetKeywords.length - 5} more</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-primary mt-3">
                  Generated: {new Date(generatedIdea.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary">
        <h3 className="font-semibold text-primary mb-2">How it works:</h3>
        <ul className="text-sm text-primary/75 space-y-1">
          <li>• Each agent can have multiple prompts (System Prompt for behavior, User Prompt for queries)</li>
          <li>• System prompts define the AI's role and behavior patterns</li>
          <li>• User prompts provide specific instructions or questions for the AI to process</li>
          <li>• Changes take effect within 5 minutes due to intelligent caching</li>
          <li>• Empty prompts will use hardcoded fallbacks to ensure system reliability</li>
          <li>• All prompts are automatically backed up with version history</li>
          <li>• <strong>🧪 Test Prompts</strong>: Click the test button to generate a single idea using your current prompts - perfect for validating changes before deployment</li>
        </ul>
      </div>

      <div className="space-y-6">
        {AGENTS.map(agent => (
          <Card key={agent.key} className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">{agent.name} Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent.prompts.map(promptKey => (
                <div key={promptKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {getPromptDisplayName(promptKey)}
                    </h4>
                    <Button
                      onClick={() => handleSave(agent.key, promptKey)}
                      disabled={!hasChanges(agent.key, promptKey) || savingStates[`${agent.key}:${promptKey}`]}
                      size="sm"
                      className={hasChanges(agent.key, promptKey) ? 'bg-primary' : ''}
                    >
                      {savingStates[`${agent.key}:${promptKey}`] ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  
                  <Textarea
                    value={prompts[agent.key]?.[promptKey] || ''}
                    onChange={(e) => handlePromptChange(agent.key, promptKey, e.target.value)}
                    placeholder={`Enter the ${getPromptDisplayName(promptKey).toLowerCase()} for ${agent.name}...`}
                    rows={8}
                    className="font-mono text-sm resize-none"
                  />
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      Characters: {prompts[agent.key]?.[promptKey]?.length || 0}
                    </span>
                    {hasChanges(agent.key, promptKey) && (
                      <span className="text-orange-600 font-medium">
                        • Unsaved changes
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}