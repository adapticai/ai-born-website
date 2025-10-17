"use client";

import { motion } from "framer-motion";

export function BookDifference() {
  const comparisons = [
    {
      others: "\"How to use AI tools\"",
      aiborn: "How to design organisations from first principles",
    },
    {
      others: "Near-term productivity hacks",
      aiborn: "Generational transformation framework",
    },
    {
      others: "Avoid the hard questions",
      aiborn: "Confront displacement head-on with solutions",
    },
    {
      others: "Tech-optimist OR dystopian",
      aiborn: "Pragmatic hope: diagnosis + actionable blueprint",
    },
    {
      others: "For one audience (business OR philosophy)",
      aiborn: "Bridges CTOs and policymakers, executives and ethicists",
    },
    {
      others: "Theoretical speculation",
      aiborn: "350+ citations, real case studies, verified data",
    },
  ];

  return (
    <section className="bg-white dark:bg-black py-24 border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-6 tracking-tight">
              Not another book about ChatGPT tips.
            </h2>
            <p className="font-inter text-lg text-slate-600 dark:text-slate-400">
              This is the operating manual for a new species of organisation.
            </p>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-2 border-slate-200 dark:border-slate-800"
          >
            {/* Table Header */}
            <div className="grid grid-cols-2 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="p-6 border-r-2 border-slate-200 dark:border-slate-800">
                <h3 className="font-outfit text-lg font-bold text-slate-500 dark:text-slate-500">
                  Most AI Books
                </h3>
              </div>
              <div className="p-6">
                <h3 className="font-outfit text-lg font-bold text-black dark:text-white">
                  AI-Born
                </h3>
              </div>
            </div>

            {/* Table Rows */}
            {comparisons.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-2 ${
                  index !== comparisons.length - 1 ? "border-b-2 border-slate-200 dark:border-slate-800" : ""
                }`}
              >
                <div className="p-6 border-r-2 border-slate-200 dark:border-slate-800">
                  <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                    {row.others}
                  </p>
                </div>
                <div className="p-6">
                  <p className="font-inter text-sm font-semibold text-black dark:text-white">
                    {row.aiborn}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
