"use client";

import { motion } from "framer-motion";

export function BookStakes() {
  const leftStats = [
    { label: "Midjourney:", value: "$200M revenue, 40 people" },
    { label: "Safe Superintelligence:", value: "$1B valuation, 10 people" },
    { label: "Gartner:", value: "15% of work decisions autonomous by 2028" },
    { label: "MIT:", value: "95% of enterprise AI pilots fail to scale" },
  ];

  const rightStats = [
    { label: "350+ citations", value: "spanning technology ethics, economic history, organisational design" },
    { label: "20 frameworks", value: "providing actionable guidance for transformation" },
    { label: "4 pathways", value: "for incumbents, startups, cooperatives, and individuals" },
    { label: "1 central thesis:", value: "Technology is choice, not destiny" },
  ];

  return (
    <section className="bg-slate-50 dark:bg-black py-24 border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-black dark:text-white mb-12 tracking-tight">
              This isn't about optimising spreadsheets. It's about redesigning what it means to organise, to work, to be.
            </h2>

            {/* Pull Quote */}
            <div className="border-l-4 border-black dark:border-white pl-8 py-6 max-w-3xl mx-auto">
              <blockquote className="font-outfit text-2xl md:text-3xl font-bold text-black dark:text-white leading-tight">
                "The machines will scale the <em>how</em>. The question that remains is whether we're wise enough to choose a <em>why</em> worthy of the power we now wield."
              </blockquote>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-12 mt-16">
            {/* Left Column: The Disruption Is Here */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border-2 border-slate-200 dark:border-slate-800 p-8"
            >
              <h3 className="font-outfit text-xl font-bold text-black dark:text-white mb-6">
                The Disruption Is Here
              </h3>
              <div className="space-y-4">
                {leftStats.map((stat, index) => (
                  <div key={index} className="pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="font-outfit text-sm font-bold text-black dark:text-white mb-1">
                      {stat.label}
                    </div>
                    <div className="font-inter text-sm text-slate-600 dark:text-slate-400">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: The Choices Are Ours */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="border-2 border-slate-200 dark:border-slate-800 p-8"
            >
              <h3 className="font-outfit text-xl font-bold text-black dark:text-white mb-6">
                The Choices Are Ours
              </h3>
              <div className="space-y-4">
                {rightStats.map((stat, index) => (
                  <div key={index} className="pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="font-outfit text-sm font-bold text-black dark:text-white mb-1">
                      {stat.label}
                    </div>
                    <div className="font-inter text-sm text-slate-600 dark:text-slate-400">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
