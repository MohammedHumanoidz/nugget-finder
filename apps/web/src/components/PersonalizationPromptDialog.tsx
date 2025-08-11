"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PersonalizationPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onYes: () => void;
  onNo: () => void;
}

export function PersonalizationPromptDialog({
  open,
  onOpenChange,
  onYes,
  onNo,
}: PersonalizationPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Want to personalize your search?</DialogTitle>
          <DialogDescription>
            Get more relevant business ideas by telling us about your skills, goals, and preferences.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onNo}
            className="w-full sm:w-auto"
          >
            No, skip
          </Button>
          <Button
            onClick={onYes}
            className="w-full sm:w-auto"
          >
            Yes, personalize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 