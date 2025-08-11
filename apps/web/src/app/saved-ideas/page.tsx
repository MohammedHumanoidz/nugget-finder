import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import SavedIdeas from "@/components/SavedIdeas";

export const metadata = {
	title: "Your Saved Ideas - NuggetFinder.io",
	description: "View and manage your saved startup ideas",
};

export default async function SavedIdeasPage() {
	return (
		<div className="min-h-screen bg-background">
			<RedirectToSignIn />
			<SavedIdeas />
		</div>
	);
}
