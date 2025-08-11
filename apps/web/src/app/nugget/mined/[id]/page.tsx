import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MinedNuggetDetailsView from "@/components/MinedNuggetDetailsView";
import { serverTRPC } from "@/lib/server-trpc";

// Force dynamic rendering since we use authentication
export const dynamic = "force-dynamic";

interface MinedNuggetPageProps {
	params: Promise<{
		id: string;
	}>;
}

// Generate metadata for this page
export async function generateMetadata({
	params,
}: MinedNuggetPageProps): Promise<Metadata> {
	const { id } = await params;

	try {
		const idea = await serverTRPC.getGeneratedIdeaById({ ideaId: id });
		if (!idea) {
			return {
				title: "Mined AI Startup Idea Not Found",
				description:
					"Explore your mined AI startup ideas with clear insights and practical steps.",
			};
		}

		const baseTitle = idea.title || "AI Startup Idea";
		const rawDesc =
			idea.executiveSummary ||
			idea.description ||
			"Your personally generated AI startup idea.";
		const description =
			rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;

		return {
			title: `${baseTitle} | AI Startup Idea`,
			description,
			alternates: { canonical: `/nugget/mined/${id}` },
		};
	} catch (error) {
		console.error("Error generating metadata for mined nugget:", error);
		return {
			title: "Mined AI Startup Idea",
			description:
				"Explore your mined AI startup ideas with clear insights and practical steps.",
		};
	}
}

export default async function MinedNuggetDetailPage({
	params,
}: MinedNuggetPageProps) {
	const { id } = await params;

	try {
		const idea = await serverTRPC.getGeneratedIdeaById({ ideaId: id });

		if (!idea) {
			notFound();
		}

		return (
			<div className="min-h-screen bg-background">
				<RedirectToSignIn />
				<MinedNuggetDetailsView idea={idea} />
			</div>
		);
	} catch (error) {
		console.error("Error loading mined nugget:", error);
		notFound();
	}
}
