"use client";

import { useState } from "react";
import { X, Settings, User, Target, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface PersonalizationData {
  skills: string;
  goals: string;
  categories: string;
  revenueGoal: number;
  timeAvailability: string;
}

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PersonalizationData) => void;
  initialData?: Partial<PersonalizationData>;
}

export default function PersonalizationModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PersonalizationModalProps) {
  const [formData, setFormData] = useState<PersonalizationData>({
    skills: initialData?.skills || "",
    goals: initialData?.goals || "",
    categories: initialData?.categories || "",
    revenueGoal: initialData?.revenueGoal || 100000,
    timeAvailability: initialData?.timeAvailability || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleInputChange = (
    field: keyof PersonalizationData,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatRevenueGoal = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-background border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Personalize Your Search</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Help us find more relevant opportunities by telling us about your skills and goals
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Skills Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <Label htmlFor="skills" className="text-base font-medium">
                What are your skills?
              </Label>
            </div>
            <Textarea
              id="skills"
              placeholder="e.g., JavaScript, Python, Design, Marketing, Data Analysis..."
              value={formData.skills}
              onChange={(e) => handleInputChange("skills", e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              List your technical skills, domain expertise, and other relevant capabilities
            </p>
          </div>

          {/* Goals Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <Label htmlFor="goals" className="text-base font-medium">
                What do you want to build?
              </Label>
            </div>
            <Textarea
              id="goals"
              placeholder="e.g., Mobile app, Web platform, AI tool, E-commerce site..."
              value={formData.goals}
              onChange={(e) => handleInputChange("goals", e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Describe the type of product or service you're interested in creating
            </p>
          </div>

          {/* Categories Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <Label htmlFor="categories" className="text-base font-medium">
                Which categories interest you most?
              </Label>
            </div>
            <Textarea
              id="categories"
              placeholder="e.g., AI & Machine Learning, Healthcare, FinTech, SaaS..."
              value={formData.categories}
              onChange={(e) => handleInputChange("categories", e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Industries, markets, or problem areas you're passionate about
            </p>
          </div>

          {/* Revenue Goal Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <Label htmlFor="revenueGoal" className="text-base font-medium">
                Revenue Goal: {formatRevenueGoal(formData.revenueGoal)}
              </Label>
            </div>
            <div className="px-3">
              <input
                type="range"
                id="revenueGoal"
                min="10000"
                max="10000000"
                step="10000"
                value={formData.revenueGoal}
                onChange={(e) => handleInputChange("revenueGoal", parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$10K</span>
                <span>$1M</span>
                <span>$10M+</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your target annual revenue for the startup
            </p>
          </div>

          {/* Time Availability Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <Label htmlFor="timeAvailability" className="text-base font-medium">
                Time Availability
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Part-time (evenings/weekends)",
                "Full-time commitment",
                "Looking for co-founder",
                "Just exploring ideas",
              ].map((option) => (
                <label
                  key={option}
                  className={`
                    flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                    ${formData.timeAvailability === option 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="timeAvailability"
                    value={option}
                    checked={formData.timeAvailability === option}
                    onChange={(e) => handleInputChange("timeAvailability", e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Personalization
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          background: hsl(var(--primary));
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background: hsl(var(--primary));
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}