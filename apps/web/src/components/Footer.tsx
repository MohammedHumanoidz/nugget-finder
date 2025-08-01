"use client";
import { motion } from "framer-motion";
import { Github, Heart, Mail, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <footer className="w-full bg-muted/30 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              animate={{
                scale: 1,
              }}
            >
              <Link href="/">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{
                      rotate: [0, 20, -20, 0],
                      scale: 1,
                    }}
                    transition={{
                      rotate: {
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 0,
                      },
                      scale: {
                        duration: 0.3,
                      },
                    }}
                    className="text-xl"
                  >
                    <Image
                      src="/logo.webp"
                      alt="logo"
                      width={100}
                      height={100}
                      className={"h-10 w-10 transition-all duration-300"}
                    />
                  </motion.span>
                  <motion.span
                    className={`font-semibold font-mono transition-all duration-300 ${"text-lg"}`}
                    animate={{
                      fontSize: "1.125rem",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    NuggetFinder
                  </motion.span>
                </div>
              </Link>
            </motion.div>
            <p className="text-muted-foreground text-sm">
              Mining the future of AI-powered startup opportunities, one nugget
              at a time.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/browse"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Explore Nuggets
              </Link>
              <Link
                href="/dashboard"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/pricing"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <div className="space-y-2 text-sm">
              <a
                href="/about"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="/blog"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </a>
              <a
                href="/careers"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Careers
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <div className="space-y-2 text-sm">
              <a
                href="/privacy"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NuggetFinder. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>You&apos;ve mined to the bottom</span>
            <span className="text-amber-500">🪙</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
