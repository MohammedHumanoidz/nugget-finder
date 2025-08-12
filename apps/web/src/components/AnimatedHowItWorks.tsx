"use client";

import { motion } from "motion/react";
import Image from "next/image";
import React from "react";

const AnimatedHowItWorks = () => {
	const steps = [
		{
			id: 1,
			title: "Signal Collection",
			description:
				"AI monitors thousands of sources across Reddit, Twitter, Hacker News, and industry forums to identify emerging problems and trends.",
			image: "/miner-with-pc.png",
			delay: 0,
		},
		{
			id: 2,
			title: "Opportunity Scoring",
			description:
				"Advanced algorithms analyze market timing, technical feasibility, monetization potential, and competitive landscape to score each opportunity.",
			image: "/miner-stats.png",
			delay: 0.2,
		},
		{
			id: 3,
			title: "Actionable Reports",
			description:
				"Generate comprehensive startup idea reports with execution plans, market analysis, and validation strategies ready for implementation.",
			image: "/geometric-miner-with-glowing-crystal.png",
			delay: 0.4,
		},
	];

	const BeamAnimation = ({ index }: { index: number }) => (
		<div
			className="relative hidden w-24 items-center justify-center md:flex"
			style={{ height: "100%", alignSelf: "center" }}
		>
			{/* Static beam base - positioned at middle of cards */}
			<div className="-translate-y-1/2 absolute top-1/2 h-0.5 w-full transform bg-border" />

			{/* Animated flowing beam */}
			<motion.div
				className="-translate-y-1/2 absolute top-1/2 h-0.5 w-8 transform bg-gradient-to-r from-transparent via-primary to-transparent"
				initial={{ x: -32, opacity: 0 }}
				animate={{
					x: 32,
					opacity: [0, 1, 1, 0],
				}}
				transition={{
					duration: 2,
					delay: index * 0.3,
					repeat: Number.POSITIVE_INFINITY,
					repeatDelay: 1,
					ease: "easeInOut",
				}}
			/>

			{/* Pulsing glow effect */}
			<motion.div
				className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-2 w-2 transform rounded-full bg-primary"
				initial={{ scale: 0, opacity: 0 }}
				animate={{
					scale: [0, 1.2, 0],
					opacity: [0, 0.8, 0],
				}}
				transition={{
					duration: 2,
					delay: index * 0.3 + 0.5,
					repeat: Number.POSITIVE_INFINITY,
					repeatDelay: 1,
					ease: "easeOut",
				}}
			/>

			{/* Arrow indicator */}
			<motion.div
				className="-translate-y-1/2 absolute top-1/2 right-0 h-0 w-0 transform border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-4 border-l-primary"
				initial={{ opacity: 0, scale: 0 }}
				animate={{
					opacity: [0, 1, 0],
					scale: [0, 1, 0],
				}}
				transition={{
					duration: 0.6,
					delay: index * 0.3 + 1,
					repeat: Number.POSITIVE_INFINITY,
					repeatDelay: 1.4,
					ease: "easeOut",
				}}
			/>
		</div>
	);

	const StepCard = ({
		step,
		index,
	}: {
		step: (typeof steps)[0];
		index: number;
	}) => (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.6,
				delay: step.delay,
				ease: "easeOut",
			}}
			whileHover={{
				scale: 1.02,
				y: -4,
				transition: { duration: 0.2 },
			}}
			className="group relative w-full overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
		>
			{/* Background gradient on hover */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				initial={false}
			/>

			{/* Step number indicator */}
			<motion.div
				className="top-3 left-3 absolute flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-sm shadow-lg"
				whileHover={{ scale: 1.1 }}
				transition={{ type: "spring", stiffness: 400 }}
			>
				{step.id}
			</motion.div>

			{/* Content */}
			<motion.div
				whileHover={{
					scale: 1.1,
					rotate: [0, -10, 10, 0],
				}}
				transition={{ duration: 0.3 }}
				className="relative z-10"
			>
				<motion.div className="mb-4 flex items-center justify-center text-4xl">
					<Image src={step.image} alt={step.title} width={100} height={100} />
				</motion.div>

				<motion.h3
					className="mb-3 text-center font-bold text-foreground text-xl"
					layoutId={`title-${step.id}`}
				>
					{step.title}
				</motion.h3>

				<motion.p
					className="text-center text-muted-foreground text-sm leading-relaxed"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: step.delay + 0.3 }}
				>
					{step.description}
				</motion.p>
			</motion.div>

			{/* Subtle border glow on hover */}
			<motion.div
				className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				initial={false}
			/>
		</motion.div>
	);

	return (
		<section className="mx-auto max-w-7xl px-4 py-16">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="mb-12 text-center"
			>
				<h2 className="mb-4 font-bold text-3xl">How It Works</h2>
				<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
					From signal to strategy—our process ensures you never miss an
					opportunity.
				</p>
				<motion.div
					className="mx-auto mt-6 h-1 w-24 bg-primary"
					initial={{ width: 0 }}
					animate={{ width: 96 }}
					transition={{ delay: 0.5, duration: 0.8 }}
				/>
			</motion.div>

			{/* Desktop Layout - Horizontal */}
			<div className="hidden items-center justify-center gap-0 md:flex">
				{steps.map((step, index) => (
					<React.Fragment key={step.id}>
						<div className="flex-1">
							<StepCard step={step} index={index} />
						</div>
						{index < steps.length - 1 && <BeamAnimation index={index} />}
					</React.Fragment>
				))}
			</div>

			{/* Mobile Layout - Vertical */}
			<div className="space-y-8 md:hidden">
				{steps.map((step, index) => (
					<div key={step.id} className="relative">
						<StepCard step={step} index={index} />

						{/* Vertical beam for mobile */}
						{index < steps.length - 1 && (
							<div className="my-6 flex justify-center">
								<div className="relative h-12 w-0.5 bg-border">
									<motion.div
										className="absolute h-4 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent"
										initial={{ y: -16, opacity: 0 }}
										animate={{
											y: 16,
											opacity: [0, 1, 1, 0],
										}}
										transition={{
											duration: 1.5,
											delay: index * 0.5,
											repeat: Number.POSITIVE_INFINITY,
											repeatDelay: 1.5,
											ease: "easeInOut",
										}}
									/>

									{/* Downward arrow */}
									<motion.div
										className="-translate-x-1/2 absolute bottom-0 left-1/2 h-0 w-0 transform border-t-4 border-t-primary border-r-2 border-r-transparent border-l-2 border-l-transparent"
										initial={{ opacity: 0, scale: 0 }}
										animate={{
											opacity: [0, 1, 0],
											scale: [0, 1, 0],
										}}
										transition={{
											duration: 0.6,
											delay: index * 0.5 + 0.7,
											repeat: Number.POSITIVE_INFINITY,
											repeatDelay: 1.4,
											ease: "easeOut",
										}}
									/>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	);
};

export default AnimatedHowItWorks;
