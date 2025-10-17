"use client";

import { motion } from "framer-motion";
import { Building2, User, Scale } from "lucide-react";

export function BookProblem() {
  const problems = [
    {
      icon: Building2,
      title: "The Enterprise Crisis",
      stat: "95% of corporate AI initiatives are failing.",
      description: "Not because the technology doesn't work—but because companies are bolting autonomous intelligence onto industrial-era hierarchies. You can't upgrade this way. You must redesign from first principles.",
    },
    {
      icon: User,
      title: "The Human Crisis",
      stat: "The modern \"job\" is a 200-year-old construct now approaching obsolescence.",
      description: "When AI agents don't just assist with work but are the workforce—executing, learning, adapting faster than any human organisation ever could—what becomes of identity, purpose, and community?",
    },
    {
      icon: Scale,
      title: "The Social Contract Crisis",
      stat: "What happens when a handful of architects control autonomous empires?",
      description: "Without new governance models, we risk hyper-concentration of wealth and power beyond anything in history. The question isn't whether AI will transform everything. It's whether we're wise enough to choose a why worthy of the power we now wield.",
    },
  ];

  return (
    <section className="bg-white dark:bg-black py-24 border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-6 tracking-tight leading-tight">
              We're witnessing a lineage break as profound as the Industrial Revolution—but at machine speed.
            </h2>
          </motion.div>

          {/* Three-Column Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {problems.map((problem, index) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8"
              >
                {/* Icon */}
                <div className="w-14 h-14 border-2 border-black dark:border-white flex items-center justify-center mb-6">
                  <problem.icon className="w-7 h-7 text-black dark:text-white" />
                </div>

                {/* Title */}
                <h3 className="font-outfit text-xl font-bold text-black dark:text-white mb-4">
                  {problem.title}
                </h3>

                {/* Stat */}
                <p className="font-outfit text-base font-semibold text-black dark:text-white mb-4">
                  {problem.stat}
                </p>

                {/* Description */}
                <p className="font-inter text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
