import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import Dashboard from "@/components/Dashboard";

export const metadata = {
	title: "Dashboard - NuggetFinder.io",
	description: "Your personal startup ideas dashboard",
};

export default async function DashboardPage() {
	return (
		<div className="min-h-screen bg-background">
			<RedirectToSignIn />
			<Dashboard />
		</div>
	);
}
