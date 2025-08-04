"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type AnimationState = 'scavenging' | 'mining' | 'found';

interface AnimatedSearchLoaderProps {
  searchQuery: string;
  onAnimationComplete?: () => void;
}

// Simple particle component for subtle effects
const Particles = ({ show, type }: { show: boolean; type: 'dust' | 'sparkle' }) => {
  if (!show) return null;

  const particleCount = type === 'dust' ? 6 : 8;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: particleCount }, (_, i) => (
        <motion.div
          key={`${type}-particle-${i}-${Math.random().toString(36).substr(2, 5)}`}
          className={`absolute w-1 h-1 rounded-full ${
            type === 'dust' ? 'bg-muted-foreground' : 'bg-primary'
          }`}
          style={{
            left: `${45 + Math.random() * 10}%`,
            top: `${55 + Math.random() * 10}%`,
          }}
          animate={{
            y: [0, -20, -40],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
      ))}
    </div>
  );
};

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

    const timer3 = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 6500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onAnimationComplete]);

  const content = {
    scavenging: {
      image: "/nuggetfinder-confused.png",
      title: "Scavenging the cave...",
      description: "Looking for the best opportunities"
    },
    mining: {
      image: "/nuggetfinder-digging-hard.png", 
      title: "Mining the nuggets...",
      description: "Analyzing thousands of startup ideas"
    },
    found: {
      image: "/nuggetfinder-super-happy.png",
      title: "Nuggets found!",
      description: "These nuggets look good, might just run away with them!"
    }
  };

  const getCharacterAnimation = () => {
    switch (animationState) {
      case 'scavenging':
        return {
          y: [0, -5, 0],
          rotate: [0, 1, -1, 0],
        };
      case 'mining':
        return {
          y: [0, -10, 0],
          rotate: [0, 3, -3, 0],
        };
      case 'found':
        return {
          y: [0, -15, 0],
          scale: [1, 1.05, 1],
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-4xl space-y-8 text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            {/* Search Query */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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

            {/* Character with subtle animation */}
            <div className="relative">
              <motion.div
                animate={getCharacterAnimation()}
                transition={{ 
                  duration: animationState === 'mining' ? 1.0 : 1.5,
                  repeat: animationState === 'mining' ? Number.POSITIVE_INFINITY : animationState === 'found' ? 2 : 0,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
              >
                <Image
                  src={content[animationState].image}
                  alt={content[animationState].title}
                  width={250}
                  height={250}
                  className="mx-auto"
                  priority
                />
              </motion.div>
              
              {/* Subtle particles */}
              <Particles 
                show={animationState === 'mining'} 
                type="dust" 
              />
              <Particles 
                show={animationState === 'found'} 
                type="sparkle" 
              />
            </div>
            
            {/* Status text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                {content[animationState].title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {content[animationState].description}
              </p>
            </motion.div>

            {/* Clean progress bar */}
            <motion.div 
              className="w-full max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: animationState === 'scavenging' ? '33%' : 
                           animationState === 'mining' ? '66%' : '100%' 
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
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
            
            {/* Final message */}
            {animationState === 'found' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-muted-foreground"
              >
                Time to see what treasures we've discovered! 💎
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 