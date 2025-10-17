"use client";

import { motion } from "framer-motion";

const frameworks = [
  {
    slug: "five-planes",
    number: "01",
    title: "The Five Planes",
    description: "Data, Models, Agents, Orchestration, Governance—the complete architectural stack for AI-native organisations",
  },
  {
    slug: "defensibility-stack",
    number: "02",
    title: "Defensibility Stack",
    description: "Where moats live in the AI era: Architecture, Governance, Evolution speed, Trust, Distribution",
  },
  {
    slug: "new-triumvirate",
    number: "03",
    title: "New Triumvirate & VP-Agent",
    description: "Architect, Intent-Setter, Guardian—the human roles that govern autonomous agent workforces",
  },
  {
    slug: "cognitive-overhead-index",
    number: "04",
    title: "Cognitive Overhead Index & Iteration Half-Life",
    description: "Measuring institutional drag and compressing decision cycles as the new competitive advantage",
  },
  {
    slug: "economy-of-being",
    number: "05",
    title: "From Extraction to Stewardship",
    description: "How AI enables capitalism upgraded—moving from narrow profit to shared prosperity and purpose",
  },
  {
    slug: "human-horizon",
    number: "06",
    title: "The Great Narrowing & The Great Unshackling",
    description: "Why work is collapsing—and why that might be humanity's greatest liberation",
  },
];

export function BookFrameworks() {
  return (
    <section id="frameworks" className="bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-4 tracking-tight">
              What You'll Learn
            </h2>
            <p className="font-inter text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              New mental models for the AI era—from organisational architecture to the future of work, value, and human purpose
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-1 mb-16">
            {frameworks.map((framework, index) => (
              <motion.div
                key={framework.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="border border-slate-200 dark:border-slate-900 hover:border-black dark:hover:border-white p-8 transition-all duration-300 group bg-white dark:bg-black"
              >
                <div className="flex items-start gap-6">
                  <span className="font-outfit text-5xl font-extrabold text-slate-200 dark:text-slate-800 group-hover:text-black dark:group-hover:text-white transition-colors duration-300 tracking-tight">
                    {framework.number}
                  </span>
                  <div>
                    <h3 className="font-outfit font-bold text-xl text-black dark:text-white mb-3 tracking-tight">
                      {framework.title}
                    </h3>
                    <p className="font-inter text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {framework.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <button className="font-outfit text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 underline underline-offset-4 transition-colors tracking-tight font-semibold">
              Read a free chapter →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
