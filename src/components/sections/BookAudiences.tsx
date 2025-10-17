"use client";

import { motion } from "framer-motion";
import { Building2, Rocket, Users, BookOpen } from "lucide-react";

const audiences = [
  {
    icon: Building2,
    title: "Strategic Decision-Makers",
    subtitle: "C-Suite Executives • Founders • VCs",
    description: "You understand AI is existential, not incremental. You need a first-principles blueprint for transformation, not a catalogue of tools. This book provides the architecture, governance frameworks, and defensibility models to build—or become—an AI-Born enterprise.",
    keyBenefit: "Navigate the lineage break with clarity and confidence",
  },
  {
    icon: Users,
    title: "Policy Shapers",
    subtitle: "Regulators • Policymakers • Think Tank Leaders",
    description: "You're grappling with mass displacement, wealth concentration, and the future social contract. This book offers concrete infrastructure: portable benefits, reskilling pathways, new ownership models, and governance frameworks that move beyond stale ideological debates.",
    keyBenefit: "Build the bridge to shared prosperity",
  },
  {
    icon: BookOpen,
    title: "Sense-Makers & Thinkers",
    subtitle: "Academics • Journalists • Intellectually Curious Professionals",
    description: "You read across disciplines and seek frameworks to understand systemic change. This book synthesises history, economics, technology, and philosophy into a coherent vision for the next economy—grounded in evidence, elevated by moral clarity.",
    keyBenefit: "Understand the most consequential transformation of our lifetimes",
  },
];

export function BookAudiences() {
  return (
    <section id="audiences" className="bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-6 tracking-tight"
            >
              Who This Book Is For
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-inter text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
            >
              Written for an intelligent, ambitious, and forward-thinking audience at the inflection point of history
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((audience, index) => (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-black border-2 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white p-8 transition-all duration-300 group"
              >
                {/* Icon */}
                <div className="w-14 h-14 border-2 border-slate-300 dark:border-slate-700 group-hover:border-black dark:group-hover:border-white flex items-center justify-center mb-6 transition-colors">
                  <audience.icon className="w-7 h-7 text-black dark:text-white" />
                </div>

                {/* Title and Subtitle */}
                <div className="mb-4">
                  <h3 className="font-outfit text-xl font-bold text-black dark:text-white mb-2 tracking-tight">
                    {audience.title}
                  </h3>
                  <p className="font-outfit text-xs text-slate-500 dark:text-slate-500 tracking-wide">
                    {audience.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="font-inter text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {audience.description}
                </p>

                {/* Key Benefit */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="font-outfit text-sm font-semibold text-black dark:text-white">
                    → {audience.keyBenefit}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Unified CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="font-inter text-slate-600 dark:text-slate-400 mb-6">
              Regardless of where you sit, this book offers a rigorous, actionable, and morally grounded path forward.
            </p>
            <a
              href="#excerpt"
              className="inline-block px-8 py-4 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-outfit font-semibold tracking-tight transition-colors rounded-none"
            >
              Read a Free Excerpt
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
