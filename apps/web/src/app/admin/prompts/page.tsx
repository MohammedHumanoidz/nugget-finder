"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';

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
      <div>
        <h1 className="text-3xl font-bold">AI Agent Prompts</h1>
        <p className="text-muted-foreground">
          Configure the system and user prompts for each AI agent to customize idea generation behavior
        </p>
      </div>

      <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary">
        <h3 className="font-semibold text-primary mb-2">How it works:</h3>
        <ul className="text-sm text-primary/75 space-y-1">
          <li>• Each agent can have multiple prompts (System Prompt for behavior, User Prompt for queries)</li>
          <li>• System prompts define the AI's role and behavior patterns</li>
          <li>• User prompts provide specific instructions or questions for the AI to process</li>
          <li>• Changes take effect within 5 minutes due to intelligent caching</li>
          <li>• Empty prompts will use hardcoded fallbacks to ensure system reliability</li>
          <li>• All prompts are automatically backed up with version history</li>
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