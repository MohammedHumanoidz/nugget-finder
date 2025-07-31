import Dashboard from "@/components/Dashboard";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";

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