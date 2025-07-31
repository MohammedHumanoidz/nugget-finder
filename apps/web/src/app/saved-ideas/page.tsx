import SavedIdeas from "@/components/SavedIdeas";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";

export const metadata = {
  title: "Your Saved Ideas - NuggetFinder.io",
  description: "View and manage your saved startup ideas",
};

export default async function SavedIdeasPage() {

  return (
    <div className="min-h-screen bg-background">
      <RedirectToSignIn/>      
      <SavedIdeas />
    </div>
  );
}