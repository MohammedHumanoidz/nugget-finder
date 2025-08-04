"use client";

import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import { CreditCard, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Prevent initial animation by setting initial load to false after mount
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);

    // Set initial mobile state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobileCheck = window.innerWidth < 768; // md breakpoint

      // Determine if navbar should be visible
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        // On mobile, be less aggressive about hiding the navbar
        if (isMobileCheck) {
          // Only hide if scrolling down significantly and mobile menu is closed
          if (!isMobileMenuOpen && currentScrollY > lastScrollY + 10) {
            setIsVisible(false);
          }
        } else {
          setIsVisible(false);
        }
        setIsMobileMenuOpen(false); // Close mobile menu when hiding
      }

      // Determine if navbar should have background/shadow
      setIsScrolled(currentScrollY > 50);

      setLastScrollY(currentScrollY);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [lastScrollY, isMobileMenuOpen]);

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
      initial={false} // Prevent initial animation
      animate={{
        y: isInitialLoad ? 0 : isVisible ? 0 : isMobile ? -60 : -100,
        opacity: isInitialLoad ? 1 : isVisible ? 1 : isMobile ? 0.3 : 0,
        scale: isMobile ? 1 : isScrolled ? 0.95 : 1,
      }}
      transition={{
        duration: isInitialLoad ? 0 : 0.3,
        ease: "easeInOut",
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`px-4 py-3 sticky top-0 z-[9999] transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <motion.div
        className="max-w-7xl mx-auto flex items-center justify-between"
        animate={{
          paddingTop: isMobile ? "0.75rem" : isScrolled ? "0.5rem" : "0.75rem",
          paddingBottom: isMobile ? "0.75rem" : isScrolled ? "0.5rem" : "0.75rem",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <motion.div
          whileHover={!isInitialLoad ? { scale: 1.05 } : {}}
          whileTap={!isInitialLoad ? { scale: 0.95 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          animate={{
            scale: isInitialLoad ? 1 : isScrolled ? 0.9 : 1,
          }}
          initial={{ scale: 1 }}
        >
          <Link href="/">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{
                  rotate: isInitialLoad ? 0 : [0, 20, -20, 0],
                  scale: isInitialLoad ? 1 : isScrolled ? 0.8 : 1,
                }}
                transition={{
                  rotate: {
                    duration: 1.5,
                    repeat: isInitialLoad ? 0 : Number.POSITIVE_INFINITY,
                    repeatDelay: 0,
                  },
                  scale: {
                    duration: isInitialLoad ? 0 : 0.3,
                  },
                }}
                initial={{ rotate: 0, scale: 1 }}
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
                  fontSize: isInitialLoad ? "1.125rem" : isScrolled ? "1rem" : "1.125rem",
                }}
                transition={{ duration: isInitialLoad ? 0 : 0.3 }}
                initial={{ fontSize: "1.125rem" }}
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
              initial={false} // Prevent initial animation
              animate={{
                opacity: 1,
                y: 0,
                scale: isScrolled ? 0.9 : 1,
              }}
              transition={{
                scale: { duration: 0.3 },
              }}
              whileHover={{ y: -2, scale: isScrolled ? 0.95 : 1.05 }}
            >
              <Link
                href={link.href}
                className="group relative text-base text-muted-foreground transition-all duration-200 hover:text-foreground"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
          ))}

          <SignedIn>
            {authenticatedLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={false} // Prevent initial animation
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{
                  scale: { duration: 0.3 },
                }}
                whileHover={{ y: -2, scale: isScrolled ? 0.95 : 1.05 }}
              >
                <Link
                  href={link.href}
                  className="group relative text-base text-muted-foreground transition-all duration-200 hover:text-foreground"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
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
          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            whileTap={{ scale: 0.95 }}
            initial={false} // Prevent initial animation
            animate={{
              opacity: 1,
              scale: isScrolled ? 0.8 : 1,
            }}
            transition={{
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
                initial={false} // Prevent initial animation
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{
                  scale: { duration: 0.3 },
                }}
                whileHover={{ scale: isScrolled ? 0.95 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth/sign-in">
                  <Button
                    variant="outline"
                    size={"default"}
                    className="transition-all duration-300"
                  >
                    Sign in
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={false} // Prevent initial animation
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{
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
                initial={false} // Prevent initial animation
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{
                  scale: { duration: 0.3 },
                }}
                whileHover={{ scale: isScrolled ? 0.95 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard">
                  <Button
                    variant="default"
                    size={"default"}
                    className="transition-all duration-300"
                  >
                    Dashboard
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={false} // Prevent initial animation
                animate={{
                  opacity: 1,
                  scale: isScrolled ? 0.8 : 1,
                }}
                transition={{
                  scale: { duration: 0.3 },
                }}
              >
                <UserButton
                  size={"icon"}
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
            className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border shadow-lg overflow-hidden z-50"
            style={{ marginTop: 0 }}
          >
            <div className="flex flex-col gap-4 p-4">
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
