import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import ClaimedIdeas from "@/components/ClaimedIdeas";

export const metadata = {
	title: "Your Claimed Ideas - NuggetFinder.io",
	description: "View and manage your exclusively claimed startup ideas",
};

export default async function ClaimedIdeasPage() {
	return (
		<div className="min-h-screen bg-background">
			<RedirectToSignIn />
			<ClaimedIdeas />
		</div>
	);
}
