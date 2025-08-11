"use client";

import { useState } from "react";
import { Settings, User, Target, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    }if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Personalize Your Search</DialogTitle>
              <DialogDescription>
                Help us find more relevant opportunities by telling us about your skills and goals
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Slider
                value={[formData.revenueGoal]}
                onValueChange={(value) => handleInputChange("revenueGoal", value[0])}
                max={10000000}
                min={10000}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$10K</span>
                <span>$5M</span>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Personalization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}