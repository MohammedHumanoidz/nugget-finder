"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';

const featureComponents = [
  { 
    key: 'isFreeQuickOverview', 
    label: 'Quick Overview', 
    description: 'Problem and solution summary with key metrics',
    defaultFree: true
  },
  { 
    key: 'isFreeWhyThisMatters', 
    label: 'Why This Matters', 
    description: 'Revenue potential, timing, and market opportunity',
    defaultFree: true
  },
  { 
    key: 'isFreeDetailedOverview', 
    label: 'Detailed Overview', 
    description: 'Complete idea description and context',
    defaultFree: true
  },
  { 
    key: 'isFreeTheClaimWhyNow', 
    label: 'The Claim (Why Now)', 
    description: 'Market timing, trends, and supporting evidence',
    defaultFree: false
  },
  { 
    key: 'isFreeWhatToBuild', 
    label: 'What to Build', 
    description: 'Technical implementation guide and architecture',
    defaultFree: false
  },
  { 
    key: 'isFreeExecutionPlan', 
    label: 'Execution Plan', 
    description: 'Step-by-step roadmap and timeline',
    defaultFree: false
  },
  { 
    key: 'isFreeMarketGap', 
    label: 'Market Gap', 
    description: 'Detailed market opportunity and positioning',
    defaultFree: false
  },
  { 
    key: 'isFreeCompetitiveLandscape', 
    label: 'Competitive Landscape', 
    description: 'Competition analysis and differentiation',
    defaultFree: false
  },
  { 
    key: 'isFreeRevenueModel', 
    label: 'Revenue Model', 
    description: 'Monetization strategy and financial projections',
    defaultFree: false
  },
  { 
    key: 'isFreeExecutionValidation', 
    label: 'Execution & Validation', 
    description: 'Validation framework and traction signals',
    defaultFree: false
  },
  { 
    key: 'isFreeChat', 
    label: 'AI Chat Interface', 
    description: 'Interactive chat with the Prospector AI',
    defaultFree: false
  },
];

type FeatureSettings = Record<string, boolean>;

export default function FeatureVisibilityPage() {
  const [settings, setSettings] = useState<FeatureSettings>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [applyToAllIdeas, setApplyToAllIdeas] = useState(false);

  // Queries
  const { data: defaults, isLoading } = useQuery(trpc.admin.getFeatureVisibilityDefaults.queryOptions());

  // Mutations
  const updateMutation = useMutation(trpc.admin.updateFeatureVisibilityDefaults.mutationOptions({
    onSuccess: (data: any) => {
      toast.success(data.message);
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  }));

  // Initialize settings when defaults load
  useEffect(() => {
    if (defaults) {
      setSettings(defaults);
    }
  }, [defaults]);

  const handleToggle = (key: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      isFreeQuickOverview: settings.isFreeQuickOverview ?? false,
      isFreeWhyThisMatters: settings.isFreeWhyThisMatters ?? false,
      isFreeDetailedOverview: settings.isFreeDetailedOverview ?? false,
      isFreeTheClaimWhyNow: settings.isFreeTheClaimWhyNow ?? false,
      isFreeWhatToBuild: settings.isFreeWhatToBuild ?? false,
      isFreeExecutionPlan: settings.isFreeExecutionPlan ?? false,
      isFreeMarketGap: settings.isFreeMarketGap ?? false,
      isFreeCompetitiveLandscape: settings.isFreeCompetitiveLandscape ?? false,
      isFreeRevenueModel: settings.isFreeRevenueModel ?? false,
      isFreeExecutionValidation: settings.isFreeExecutionValidation ?? false,
      isFreeChat: settings.isFreeChat ?? false,
      applyToAllIdeas,
    });
  };

  const handleReset = () => {
    if (defaults) {
      setSettings(defaults);
      setHasChanges(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = featureComponents.reduce((acc, component) => {
      acc[component.key] = component.defaultFree;
      return acc;
    }, {} as FeatureSettings);
    
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p>Loading feature settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feature Visibility</h1>
          <p className="text-muted-foreground">
            Control which components are visible to free vs paid users
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              Reset Changes
            </Button>
          )}
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending || !hasChanges}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Component Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Component Visibility for Free Users</CardTitle>
              <p className="text-sm text-muted-foreground">
                These settings apply to all future ideas. Paid users can always see all components.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Apply to All Ideas Checkbox */}
              <div className="flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Switch
                  id="applyToAllIdeas"
                  checked={applyToAllIdeas}
                  onCheckedChange={setApplyToAllIdeas}
                />
                <div className="flex-1">
                  <Label htmlFor="applyToAllIdeas" className="font-medium text-yellow-800">
                    Apply to All Existing Ideas
                  </Label>
                  <p className="text-sm text-yellow-700">
                    Check this to update feature visibility for ALL existing ideas immediately. 
                    If unchecked, changes only apply to future ideas.
                  </p>
                </div>
              </div>

              {featureComponents.map((component) => (
                <div key={component.key} className="flex items-start justify-between space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={component.key} className="font-medium">
                        {component.label}
                      </Label>
                      <Badge variant={component.defaultFree ? "secondary" : "outline"}>
                        {component.defaultFree ? "Free by default" : "Paid by default"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {component.description}
                    </p>
                  </div>
                  <Switch
                    id={component.key}
                    checked={settings[component.key] ?? false}
                    onCheckedChange={(checked) => handleToggle(component.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Free User View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {featureComponents.map((component) => (
                    <div key={component.key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{component.label}</span>
                      <Badge variant={settings[component.key] ? "default" : "secondary"}>
                        {settings[component.key] ? "Visible" : "Hidden"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paid User View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {featureComponents.map((component) => (
                    <div key={component.key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{component.label}</span>
                      <Badge variant="default">Visible</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}