"use client";

import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import { CreditCard, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if navbar should be visible
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsVisible(false);
        setIsMobileMenuOpen(false); // Close mobile menu when hiding
      }

      // Determine if navbar should have background/shadow
      setIsScrolled(currentScrollY > 50);

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Explore Nuggets" },
    { href: "/pricing", label: "Pricing" },
  ];

  const authenticatedLinks = [
    { href: "/saved-ideas", label: "Saved Ideas" },
    { href: "/claimed-ideas", label: "Claimed Ideas" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
        scale: isScrolled ? 0.95 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`px-4 py-3 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <motion.div
        className="max-w-7xl mx-auto flex items-center justify-between"
        animate={{
          paddingTop: isScrolled ? "0.5rem" : "0.75rem",
          paddingBottom: isScrolled ? "0.5rem" : "0.75rem",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          animate={{
            scale: isScrolled ? 0.9 : 1,
          }}
        >
          <Link href="/">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{
                  rotate: [0, 20, -20, 0],
                  scale: isScrolled ? 0.8 : 1,
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
                  className={`transition-all duration-300 ${
                    isScrolled ? "h-8 w-8" : "h-10 w-10"
                  }`}
                />
              </motion.span>
              <motion.span
                className={`font-semibold font-mono transition-all duration-300 ${
                  isScrolled ? "text-base" : "text-lg"
                }`}
                animate={{
                  fontSize: isScrolled ? "1rem" : "1.125rem",
                }}
                transition={{ duration: 0.3 }}
              >
                NuggetFinder
              </motion.span>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          className="hidden md:flex items-center gap-6"
          animate={{
            gap: isScrolled ? "1rem" : "1.5rem",
          }}
          transition={{ duration: 0.3 }}
        >
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isScrolled ? 0.9 : 1,
              }}
              transition={{
                delay: index * 0.1 + 0.2,
                scale: { duration: 0.3 },
              }}
              whileHover={{ y: -2, scale: isScrolled ? 0.95 : 1.05 }}
            >
              <Link
                href={link.href}
                className={`text-muted-foreground hover:text-foreground transition-all duration-200 relative group ${
                  isScrolled ? "text-sm" : "text-base"
                }`}
              >
                {link.label}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                  whileHover={{ width: "100%" }}
                />
              </Link>
            </motion.div>
          ))}

          <SignedIn>
            {authenticatedLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{
                  delay: (navLinks.length + index) * 0.1 + 0.2,
                  scale: { duration: 0.3 },
                }}
                whileHover={{ y: -2, scale: isScrolled ? 0.95 : 1.05 }}
              >
                <Link
                  href={link.href}
                  className={`text-muted-foreground hover:text-foreground transition-all duration-200 relative group ${
                    isScrolled ? "text-sm" : "text-base"
                  }`}
                >
                  {link.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                    whileHover={{ width: "100%" }}
                  />
                </Link>
              </motion.div>
            ))}
          </SignedIn>
        </motion.div>

        {/* Right Side Actions */}
        <motion.div
          className="flex items-center gap-3"
          animate={{
            gap: isScrolled ? "0.5rem" : "0.75rem",
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: isScrolled ? 0.8 : 1,
            }}
            transition={{
              delay: 0.4,
              scale: { duration: 0.3 },
            }}
          >
            <ModeToggle />
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              scale: isScrolled ? 0.8 : 1,
            }}
            transition={{
              delay: 0.5,
              scale: { duration: 0.3 },
            }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={isScrolled ? 20 : 24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={isScrolled ? 20 : 24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{
                  delay: 0.6,
                  scale: { duration: 0.3 },
                }}
                whileHover={{ scale: isScrolled ? 0.95 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/sign-in">
                  <Button
                    variant="outline"
                    size={isScrolled ? "sm" : "default"}
                    className="transition-all duration-300"
                  >
                    Sign in
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{
                  delay: 0.7,
                  scale: { duration: 0.3 },
                }}
                whileHover={{ scale: isScrolled ? 0.95 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/sign-up">
                  <Button
                    variant="default"
                    size={isScrolled ? "sm" : "default"}
                    className="transition-all duration-300"
                  >
                    Sign up
                  </Button>
                </Link>
              </motion.div>
            </SignedOut>
            <SignedIn>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{
                  delay: 0.6,
                  scale: { duration: 0.3 },
                }}
                whileHover={{ scale: isScrolled ? 0.95 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard">
                  <Button
                    variant="default"
                    size={isScrolled ? "sm" : "default"}
                    className="transition-all duration-300"
                  >
                    Dashboard
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: isScrolled ? 0.8 : 1,
                }}
                transition={{
                  delay: 0.7,
                  scale: { duration: 0.3 },
                }}
              >
                <UserButton
                  size={isScrolled ? "sm" : "icon"}
                  additionalLinks={[
                    {
                      href: "/subscription",
                      label: "Subscription",
                      icon: <CreditCard />,
                    },
                  ]}
                />
              </motion.div>
            </SignedIn>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-border mt-3 pt-3 overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              {/* Mobile Navigation Links */}
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <SignedIn>
                {authenticatedLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navLinks.length + index) * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </SignedIn>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <SignedOut>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/sign-up"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="default" className="w-full">
                        Sign up
                      </Button>
                    </Link>
                  </motion.div>
                </SignedOut>
                <SignedIn>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="default" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center pt-2"
                  >
                    <UserButton
                      size="icon"
                      additionalLinks={[
                        {
                          href: "/subscription",
                          label: "Subscription",
                          icon: <CreditCard />,
                        },
                      ]}
                    />
                  </motion.div>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
