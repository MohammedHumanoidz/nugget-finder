"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

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
      className="hidden md:flex items-center justify-center w-24 relative"
      style={{ height: "100%", alignSelf: "center" }}
    >
      {/* Static beam base - positioned at middle of cards */}
      <div className="w-full h-0.5 bg-border absolute top-1/2 transform -translate-y-1/2" />

      {/* Animated flowing beam */}
      <motion.div
        className="absolute w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent top-1/2 transform -translate-y-1/2"
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
        className="absolute w-2 h-2 bg-primary rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary border-t-2 border-t-transparent border-b-2 border-b-transparent"
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
      className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group w-full"
    >
      {/* Background gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />

      {/* Step number indicator */}
      <motion.div
        className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg"
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
        <motion.div className="text-4xl mb-4 flex justify-center items-center">
          <Image src={step.image} alt={step.title} width={100} height={100} />
        </motion.div>

        <motion.h3
          className="text-xl font-bold text-foreground mb-3 text-center"
          layoutId={`title-${step.id}`}
        >
          {step.title}
        </motion.h3>

        <motion.p
          className="text-muted-foreground text-sm leading-relaxed text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: step.delay + 0.3 }}
        >
          {step.description}
        </motion.p>
      </motion.div>

      {/* Subtle border glow on hover */}
      <motion.div
        className="absolute inset-0 border-2 border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />
    </motion.div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From signal to strategy—our process ensures you never miss an
          opportunity.
        </p>
        <motion.div
          className="w-24 h-1 bg-primary mx-auto mt-6"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:flex items-center justify-center gap-0">
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
      <div className="md:hidden space-y-8">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <StepCard step={step} index={index} />

            {/* Vertical beam for mobile */}
            {index < steps.length - 1 && (
              <div className="flex justify-center my-6">
                <div className="relative w-0.5 h-12 bg-border">
                  <motion.div
                    className="absolute w-0.5 h-4 bg-gradient-to-b from-transparent via-primary to-transparent"
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
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-t-4 border-t-primary"
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

      {/* Success Metric */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-12  text-center"
      >
        <motion.div
          className="text-2xl font-bold text-foreground mb-2"
          whileHover={{ scale: 1.05 }}
        >
          Success Metric
        </motion.div>
        <motion.div
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          95% of users report faster market validation using our AI-driven
          insights
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AnimatedHowItWorks;
