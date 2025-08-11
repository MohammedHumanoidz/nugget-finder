import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import MinedNuggets from "@/components/MinedNuggets";

export const metadata = {
	title: "Your Mined Nuggets - NuggetFinder.io",
	description: "View and manage your personally generated business ideas",
};

export default async function MinedNuggetsPage() {
	return (
		<div className="min-h-screen bg-background">
			<RedirectToSignIn />
			<MinedNuggets />
		</div>
	);
}
