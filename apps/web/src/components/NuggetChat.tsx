"use client";

import { useChat } from "ai/react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { IdeaDetailsViewProps } from "@/types/idea-details";

interface NuggetChatProps {
	idea: IdeaDetailsViewProps["idea"];
}

export default function NuggetChat({ idea }: NuggetChatProps) {
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const { messages, input, handleInputChange, handleSubmit, isLoading } =
		useChat({
			api: `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/chat`,
			body: {
				ideaId: idea.id,
				ideaTitle: idea.title,
				ideaDescription: idea.description,
			},
			onFinish: () => {
				// Scroll to bottom when message is finished
				setTimeout(() => {
					if (scrollAreaRef.current) {
						const scrollContainer = scrollAreaRef.current.querySelector(
							"[data-radix-scroll-area-viewport]",
						);
						if (scrollContainer) {
							scrollContainer.scrollTop = scrollContainer.scrollHeight;
						}
					}
				}, 100);
			},
		});

	// Auto-scroll to bottom when new messages arrive or when loading state changes
	useEffect(() => {
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				// Smooth scroll to bottom
				scrollContainer.scrollTo({
					top: scrollContainer.scrollHeight,
					behavior: "smooth",
				});
			}
		}
	}, [messages, Boolean(isLoading)]);

	return (
		<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
			<div className="flex px-6 py-2">
				<Image
					src="/nugget-faq.webp"
					alt="nugget faq"
					width={100}
					height={100}
					className="h-20 w-20 object-cover"
				/>
				<h3 className="flex items-center gap-2 bg-muted/50 font-semibold text-foreground text-lg">
					<MessageCircle className="h-5 w-5" />
					Ask Pip the Prospector to dig deeper
				</h3>
			</div>

			<div className="p-4 py-0">
				<div
					className={`mb-4 flex min-h-[200px] flex-col rounded-lg bg-muted/30 p-4 ${
						isLoading ? "border-2 border-primary/20 bg-primary/5" : ""
					}`}
				>
					{/* Chat Messages */}
					<ScrollArea ref={scrollAreaRef} className="h-[400px] w-full flex-1">
						<div className="space-y-3 pr-4">
							{messages.length === 0 && (
								<div className="max-w-xs rounded-lg bg-primary/10 p-3 text-primary">
									<p className="text-sm">
										Howdy fellow miner! Curious about this nugget. Ask me
										anything about the market opportunity, risks, competitive
										analysis, or implementation details.
									</p>
								</div>
							)}

							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[80%] rounded-lg p-3 ${
											message.role === "user"
												? "ml-auto bg-muted text-foreground"
												: "bg-primary/10 text-primary"
										}`}
									>
										<div className="text-sm">
											{message.role === "user" ? (
												<div className="whitespace-pre-wrap">
													{message.content}
												</div>
											) : (
												<ReactMarkdown
													remarkPlugins={[remarkGfm]}
													components={{
														h1: ({ children }) => (
															<h1 className="mb-2 font-bold text-lg text-primary">
																{children}
															</h1>
														),
														h2: ({ children }) => (
															<h2 className="mb-2 font-bold text-base text-primary">
																{children}
															</h2>
														),
														h3: ({ children }) => (
															<h3 className="mb-1 font-bold text-primary text-sm">
																{children}
															</h3>
														),
														p: ({ children }) => (
															<p className="mb-2 text-primary last:mb-0">
																{children}
															</p>
														),
														ul: ({ children }) => (
															<ul className="mb-2 list-inside list-disc text-primary">
																{children}
															</ul>
														),
														ol: ({ children }) => (
															<ol className="mb-2 list-inside list-decimal text-primary">
																{children}
															</ol>
														),
														li: ({ children }) => (
															<li className="mb-1 text-primary">{children}</li>
														),
														strong: ({ children }) => (
															<strong className="font-semibold text-primary">
																{children}
															</strong>
														),
														em: ({ children }) => (
															<em className="text-primary italic">
																{children}
															</em>
														),
														code: ({ children }) => (
															<code className="rounded bg-primary/20 px-1 py-0.5 text-primary text-xs">
																{children}
															</code>
														),
														pre: ({ children }) => (
															<pre className="mb-2 overflow-x-auto rounded bg-primary/20 p-2 text-xs">
																{children}
															</pre>
														),
														blockquote: ({ children }) => (
															<blockquote className="mb-2 border-primary/30 border-l-4 pl-3 italic">
																{children}
															</blockquote>
														),
													}}
												>
													{message.content}
												</ReactMarkdown>
											)}
										</div>
									</div>
								</div>
							))}

							{isLoading && (
								<div className="flex justify-start">
									<div className="max-w-xs rounded-lg bg-primary/10 p-3 text-primary">
										<div className="flex items-center gap-2 text-sm">
											<Loader2 className="h-4 w-4 animate-spin" />
											Thinking...
										</div>
									</div>
								</div>
							)}
						</div>
					</ScrollArea>

					{/* Chat Input */}
					<form onSubmit={handleSubmit} className="mt-4 flex gap-2">
						<input
							type="text"
							value={input}
							onChange={handleInputChange}
							placeholder={
								isLoading ? "Pip is thinking..." : "Ask me about this nugget..."
							}
							className={`flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
								isLoading ? "opacity-50" : ""
							}`}
							disabled={isLoading}
						/>
						<Button
							type="submit"
							className="flex items-center gap-2"
							disabled={isLoading || !input.trim()}
						>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Thinking
								</>
							) : (
								<>
									<Send className="h-4 w-4" />
									Send
								</>
							)}
						</Button>
					</form>

					{/* Quick Questions */}
					<div className="mt-3 flex flex-wrap gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const syntheticEvent = {
									preventDefault: () => {},
									currentTarget: {
										elements: {
											message: {
												value: "What are the main risks with this idea?",
											},
										},
									},
								} as any;
								handleInputChange({
									target: { value: "What are the main risks with this idea?" },
								} as any);
								setTimeout(() => handleSubmit(syntheticEvent), 0);
							}}
							className={`h-auto rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted/80 ${
								isLoading ? "cursor-not-allowed opacity-50" : ""
							}`}
							disabled={isLoading}
						>
							Show me risks
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const syntheticEvent = {
									preventDefault: () => {},
									currentTarget: {
										elements: {
											message: {
												value: "What's the market size for this opportunity?",
											},
										},
									},
								} as any;
								handleInputChange({
									target: {
										value: "What's the market size for this opportunity?",
									},
								} as any);
								setTimeout(() => handleSubmit(syntheticEvent), 0);
							}}
							className={`h-auto rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted/80 ${
								isLoading ? "cursor-not-allowed opacity-50" : ""
							}`}
							disabled={isLoading}
						>
							Market size
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const syntheticEvent = {
									preventDefault: () => {},
									currentTarget: {
										elements: {
											message: {
												value: "How do I validate this idea quickly?",
											},
										},
									},
								} as any;
								handleInputChange({
									target: { value: "How do I validate this idea quickly?" },
								} as any);
								setTimeout(() => handleSubmit(syntheticEvent), 0);
							}}
							className={`h-auto rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted/80 ${
								isLoading ? "cursor-not-allowed opacity-50" : ""
							}`}
							disabled={isLoading}
						>
							Validation strategy
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
