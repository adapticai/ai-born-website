"use client";

import { motion } from "framer-motion";
import { Download, Gift, CheckCircle, ArrowRight } from "lucide-react";

import { BonusClaimForm } from "@/components/forms/BonusClaimForm";
import { EmailCaptureForm } from "@/components/forms/EmailCaptureForm";

export function BookExcerpt() {
  return (
    <section id="excerpt" className="relative bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* Free Excerpt Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Gradient background accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900/50 dark:via-black dark:to-slate-900/50 rounded-none" />

            <div className="relative border-2 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
              <div className="p-8 md:p-12 lg:p-16">
                <div className="flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 border-2 border-black dark:border-white flex items-center justify-center">
                      <Download className="w-8 h-8 text-black dark:text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-4 tracking-tight">
                      Read Before You Buy
                    </h3>
                    <p className="font-inter text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                      Get a free excerpt from AI-Born and discover why leaders at Fortune 500 firms, venture-backed startups, and policy institutions are calling this "the definitive blueprint for the AI era."
                    </p>
                  </div>
                </div>

                {/* Features list */}
                <div className="grid md:grid-cols-3 gap-6 mb-10 pb-10 border-b border-slate-200 dark:border-slate-800">
                  {[
                    "25-page design-polished excerpt",
                    "Instant PDF delivery",
                    "Launch updates included"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
                      <span className="font-inter text-sm text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                  <EmailCaptureForm source="hero-excerpt" />
                  <p className="font-inter text-xs text-slate-500 dark:text-slate-600 mt-4">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pre-order Bonus Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Gradient background accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black dark:from-white dark:via-slate-50 dark:to-white opacity-[0.02] dark:opacity-[0.02] rounded-none" />

            <div className="relative border-2 border-black dark:border-white bg-white dark:bg-black">
              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-black via-slate-600 to-black dark:from-white dark:via-slate-400 dark:to-white" />

              <div className="p-8 md:p-12 lg:p-16">
                <div className="flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-black dark:bg-white border-2 border-black dark:border-white flex items-center justify-center">
                      <Gift className="w-8 h-8 text-white dark:text-black" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold font-outfit tracking-tight mb-4">
                      <Gift className="w-3 h-3" />
                      PRE-ORDER BONUS
                    </div>
                    <h3 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-4 tracking-tight">
                      Claim Your Agent Charter Pack
                    </h3>
                    <p className="font-inter text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                      Pre-order <strong className="text-black dark:text-white font-semibold">AI-Born</strong> from any retailer and claim your exclusive <strong className="text-black dark:text-white font-semibold">Agent Charter Pack</strong>.
                    </p>
                  </div>
                </div>

                {/* What's included */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 md:p-8 mb-10">
                  <h4 className="font-outfit text-lg font-bold text-black dark:text-white mb-6 tracking-tight">
                    What's Included:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "VP-Agent Templates",
                      "Sub-Agent Ladders",
                      "Escalation/Override Protocols",
                      "Cognitive Overhead Index (COI) Diagnostic Tool"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                        <span className="font-inter text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-white dark:bg-black border-2 border-slate-200 dark:border-slate-800 p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                      <span className="text-white dark:text-black text-sm font-bold font-outfit">!</span>
                    </div>
                    <div>
                      <h5 className="font-outfit text-sm font-bold text-black dark:text-white mb-2 tracking-tight">
                        How it works:
                      </h5>
                      <p className="font-inter text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Upload your proof of purchase from any retailer below. We'll verify and send your Agent Charter Pack within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                  <BonusClaimForm />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
