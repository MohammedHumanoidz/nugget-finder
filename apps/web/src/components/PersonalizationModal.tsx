"use client";

import { Clock, DollarSign, Settings, Target, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

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
		value: string | number,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const formatRevenueGoal = (value: number): string => {
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `$${(value / 1000).toFixed(0)}K`;
		}
		return `$${value}`;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] w-7xl overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-primary/10 p-2">
							<Settings className="h-5 w-5 text-primary" />
						</div>
						<div>
							<DialogTitle>Personalize Your Search</DialogTitle>
							<DialogDescription>
								Help us find more relevant opportunities by telling us about
								your skills and goals
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Skills Section */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-primary" />
							<Label htmlFor="skills" className="font-medium text-base">
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
						<p className="text-muted-foreground text-xs">
							List your technical skills, domain expertise, and other relevant
							capabilities
						</p>
					</div>

					{/* Goals Section */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Target className="h-4 w-4 text-primary" />
							<Label htmlFor="goals" className="font-medium text-base">
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
						<p className="text-muted-foreground text-xs">
							Describe the type of product or service you're interested in
							creating
						</p>
					</div>

					{/* Categories Section */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Settings className="h-4 w-4 text-primary" />
							<Label htmlFor="categories" className="font-medium text-base">
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
						<p className="text-muted-foreground text-xs">
							Industries, markets, or problem areas you're passionate about
						</p>
					</div>

					{/* Revenue Goal Section */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4 text-primary" />
							<Label htmlFor="revenueGoal" className="font-medium text-base">
								Revenue Goal: {formatRevenueGoal(formData.revenueGoal)}
							</Label>
						</div>
						<div className="px-3">
							<Slider
								value={[formData.revenueGoal]}
								onValueChange={(value) =>
									handleInputChange("revenueGoal", value[0])
								}
								max={10000000}
								min={10000}
								step={10000}
								className="w-full"
							/>
							<div className="mt-2 flex justify-between text-muted-foreground text-xs">
								<span>$10K</span>
								<span>$5M</span>
								<span>$10M+</span>
							</div>
						</div>
						<p className="text-muted-foreground text-xs">
							Your target annual revenue for the startup
						</p>
					</div>

					{/* Time Availability Section */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-primary" />
							<Label
								htmlFor="timeAvailability"
								className="font-medium text-base"
							>
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
									className={`flex cursor-pointer items-center rounded-lg border p-3 transition-colors ${
										formData.timeAvailability === option
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50"
									} `}
								>
									<input
										type="radio"
										name="timeAvailability"
										value={option}
										checked={formData.timeAvailability === option}
										onChange={(e) =>
											handleInputChange("timeAvailability", e.target.value)
										}
										className="sr-only"
									/>
									<span className="text-sm">{option}</span>
								</label>
							))}
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" className="bg-primary hover:bg-primary/90">
							<Settings className="mr-2 h-4 w-4" />
							Save Personalization
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
