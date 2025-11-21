"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { ExcerptModal } from "@/components/ExcerptModal";
import { RetailerMenu } from "@/components/RetailerMenu";

interface BookHeroClientProps {
  isAuthenticated: boolean;
  hasContent: boolean;
}

export function BookHeroClient({
  isAuthenticated,
  hasContent,
}: BookHeroClientProps) {
  const [showExcerpt, setShowExcerpt] = useState(false);

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-white text-black dark:bg-black dark:text-white">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Left: Book Cover */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Shadow beneath book */}
              <div className="absolute -bottom-8 left-1/2 h-12 w-[75%] -translate-x-1/2 rounded-full bg-black/60 blur-2xl dark:bg-black/80" />

              {/* Book Cover Image */}
              <img
                src="/book-cover-transparent.png"
                alt="AI-Born book cover"
                className="relative h-auto w-[400px] drop-shadow-2xl md:w-[600px]"
              />
            </div>
          </motion.div>

          {/* Right: Content - Minimal and direct */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="space-y-10"
          >
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-outfit mb-8 text-4xl leading-[0.95] font-extrabold tracking-tight text-black md:text-5xl lg:text-4xl xl:text-5xl dark:text-white"
              >
                The job title is dying. <br />
                What comes next will
                <br /> define our species.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="font-inter max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl dark:text-slate-300"
              >
                When three people can orchestrate what once required 30,000, the
                entire architecture of enterprise—and human purpose—must be
                redesigned from scratch.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              {/* Pre-order CTA - always visible */}
              <RetailerMenu
                triggerText="Pre‑order Now"
                triggerVariant="primary"
                initialFormat="hardcover"
                originSection="hero"
                className="font-outfit h-[52px] rounded-none bg-black px-8 py-3 text-base font-semibold leading-tight tracking-tight text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
              />

              {/* Secondary CTA - changes based on auth status */}
              {isAuthenticated && hasContent ? (
                // Authenticated user with content - show "View My Downloads"
                <Link
                  href="/redeem"
                  className="font-outfit h-[52px] rounded-none border-2 border-black px-8 py-3 text-base font-semibold leading-tight tracking-tight text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center"
                >
                  View My Downloads
                </Link>
              ) : (
                // Non-authenticated or no content - show "Read Free Excerpt"
                <button
                  onClick={() => setShowExcerpt(true)}
                  className="font-outfit h-[52px] rounded-none border-2 border-black px-8 py-3 text-base font-semibold leading-tight tracking-tight text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Read Free Excerpt
                </button>
              )}
            </motion.div>

            {/* Social Proof Strip - Enhanced */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="border-t border-slate-200 pt-10 dark:border-slate-800"
            >
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-inter text-xs tracking-wider text-slate-500 uppercase dark:text-slate-500">
                  Trusted by leaders at
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="font-outfit flex h-8 w-8 items-center justify-center border-2 border-white bg-slate-200 text-xs font-bold text-slate-600 dark:border-black dark:bg-slate-800 dark:text-slate-400"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="font-inter ml-2 text-xs text-slate-500 dark:text-slate-500">
                    1,200+ pre-orders
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="font-inter text-xs tracking-wide text-slate-400 dark:text-slate-500">
                  Fortune 500
                </div>
                <div className="font-inter text-xs tracking-wide text-slate-400 dark:text-slate-500">
                  Venture Capital
                </div>
                <div className="font-inter text-xs tracking-wide text-slate-400 dark:text-slate-500">
                  Policy Institutions
                </div>
                <div className="font-inter text-xs tracking-wide text-slate-400 dark:text-slate-500">
                  AI Research
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Excerpt Modal */}
      <ExcerptModal open={showExcerpt} onOpenChange={setShowExcerpt} />
    </section>
  );
}
