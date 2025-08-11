import { Suspense } from "react";
import { notFound } from "next/navigation";
import ResultsClient from "./ResultsClient";

interface ResultsPageProps {
  params: Promise<{ requestId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { requestId } = await params;

  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(requestId)) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-white">Loading...</div>
          </div>
        }
      >
        <ResultsClient requestId={requestId} />
      </Suspense>
    </div>
  );
} 