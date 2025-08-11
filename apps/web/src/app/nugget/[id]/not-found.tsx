import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background">
			<div
				className="flex items-center justify-center"
				style={{ minHeight: "calc(100vh - 80px)" }}
			>
				<div className="text-center">
					<h1 className="mb-4 font-bold text-4xl">Nugget Not Found</h1>
					<p className="mb-8 text-lg text-muted-foreground">
						The nugget you're looking for doesn't exist or has been removed.
					</p>
					<Link
						href="/"
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
					>
						Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
