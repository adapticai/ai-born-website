"use client";

import { motion } from "framer-motion";
import { Layers, Users, Shield, Heart } from "lucide-react";

export function BookSolution() {
  const solutions = [
    {
      icon: Layers,
      number: "1",
      title: "Technical Architecture",
      items: [
        "The Five Planes",
        "VP-Agents & Swarms",
        "The Defensibility Stack",
        "Iteration Half-Life",
        "Cognitive Overhead Index",
      ],
      audience: "For: CTOs, architects, founders building AI-native companies",
    },
    {
      icon: Users,
      number: "2",
      title: "Social Infrastructure",
      items: [
        "Radical Reskilling",
        "Portable Benefits",
        "Productivity Dividends",
        "The Return of Community",
        "Education for Agency",
      ],
      audience: "For: Policymakers, labour leaders, educators",
    },
    {
      icon: Shield,
      number: "3",
      title: "Governance Models",
      items: [
        "Steward-Ownership",
        "Commons Frameworks",
        "The Widening of We",
        "Participatory Technology Assessment",
        "Values-Conscious Architecture",
      ],
      audience: "For: Regulators, ethicists, institutional investors",
    },
    {
      icon: Heart,
      number: "4",
      title: "Human Purpose",
      items: [
        "From Economy of Doing to Economy of Being",
        "Liberation from Toil",
        "Taste as a Moat",
        "The Great Narrowing",
        "The Spiritual Upgrade",
      ],
      audience: "For: Anyone seeking to understand the most consequential transformation of our lifetimes",
    },
  ];

  return (
    <section className="bg-slate-50 dark:bg-black py-24 border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-6 tracking-tight">
              AI-Born is the blueprint for that transformation.
            </h2>
            <p className="font-inter text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Part field manual, part manifesto—this is the first comprehensive guide to:
            </p>
          </motion.div>

          {/* Four-Column Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-black border-2 border-slate-200 dark:border-slate-800 p-6"
              >
                {/* Icon */}
                <div className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center mb-4">
                  <solution.icon className="w-6 h-6 text-black dark:text-white" />
                </div>

                {/* Number and Title */}
                <div className="mb-4">
                  <div className="font-outfit text-sm font-bold text-slate-500 dark:text-slate-500 mb-2">
                    {solution.number}.
                  </div>
                  <h3 className="font-outfit text-lg font-bold text-black dark:text-white">
                    {solution.title}
                  </h3>
                </div>

                {/* Items List */}
                <ul className="space-y-2 mb-6">
                  {solution.items.map((item, i) => (
                    <li key={i} className="font-inter text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>

                {/* Audience */}
                <p className="font-inter text-xs text-slate-500 dark:text-slate-500 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4">
                  {solution.audience}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
