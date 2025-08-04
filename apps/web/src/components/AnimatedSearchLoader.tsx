"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type AnimationState = 'scavenging' | 'mining' | 'found';

interface AnimatedSearchLoaderProps {
  searchQuery: string;
  onAnimationComplete?: () => void;
}

export default function AnimatedSearchLoader({ 
  searchQuery, 
  onAnimationComplete 
}: AnimatedSearchLoaderProps) {
  const [animationState, setAnimationState] = useState<AnimationState>('scavenging');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationState('mining');
    }, 1500);

    const timer2 = setTimeout(() => {
      setAnimationState('found');
    }, 4000);

    // Complete animation only after showing the "found" state for a while
    const timer3 = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 6500); // 2.5 seconds after "found" state to enjoy the success message

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onAnimationComplete]);

  const animationContent = {
    scavenging: {
      image: "/nuggetfinder-confused.png",
      text: "Scavenging the cave...",
      description: "Looking for the best opportunities"
    },
    mining: {
      image: "/nuggetfinder-digging-hard.png", 
      text: "Mining the nuggets...",
      description: "Analyzing thousands of startup ideas"
    },
    found: {
      image: "/nuggetfinder-super-happy.png",
      text: "Nuggets found!",
      description: "These nuggets look good, might just run away with them!"
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-4xl space-y-8 text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationState}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            {/* Search Query Display */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Mining for
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground max-w-2xl">
                "{searchQuery}"
              </h1>
            </motion.div>

            {/* Animated Character */}
            <motion.div
              animate={{ 
                y: animationState === 'mining' ? [0, -15, 0] : 0,
                rotate: animationState === 'mining' ? [0, 8, -8, 0] : 0,
                scale: animationState === 'found' ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                duration: animationState === 'mining' ? 1.2 : 0.5,
                repeat: animationState === 'mining' ? Number.POSITIVE_INFINITY : animationState === 'found' ? 2 : 0,
                repeatType: "reverse"
              }}
            >
              <Image
                src={animationContent[animationState].image}
                alt={animationContent[animationState].text}
                width={250}
                height={250}
                className="mx-auto"
                priority
              />
            </motion.div>
            
            {/* Status Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                {animationContent[animationState].text}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                {animationContent[animationState].description}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div className="w-full max-w-md mx-auto">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: animationState === 'scavenging' ? '33%' : 
                           animationState === 'mining' ? '66%' : '100%' 
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span className={animationState === 'scavenging' ? 'text-primary font-medium' : ''}>
                  Searching
                </span>
                <span className={animationState === 'mining' ? 'text-primary font-medium' : ''}>
                  Analyzing
                </span>
                <span className={animationState === 'found' ? 'text-primary font-medium' : ''}>
                  Complete
                </span>
              </div>
            </motion.div>
            
            {/* Completion Message */}
            {animationState === 'found' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-muted-foreground text-lg"
              >
                Time to see what treasures we've discovered! 💎
              </motion.div>
            )}

            {/* Sparkling Effects for Found State */}
            {animationState === 'found' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`spark-${i}-${Math.random()}`}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 