"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const endorsements = [
  {
    id: "1",
    quote: "A blueprint for the inevitable. Granfar doesn't just predict the future—he provides the architecture to build it.",
    name: "Dr. Sarah Chen",
    title: "Chief Strategy Officer",
    affiliation: "Global Tech Ventures",
    featured: true,
  },
  {
    id: "2",
    quote: "The most rigorous and hopeful analysis of AI's impact on work I've encountered. Essential reading for every leader.",
    name: "Marcus Williams",
    title: "Former CTO",
    affiliation: "Fortune 100 Technology Company",
    featured: true,
  },
  {
    id: "3",
    quote: "AI-Born bridges the gap between technical possibility and human purpose. This is the playbook we've been waiting for.",
    name: "Prof. Elena Rodriguez",
    title: "Director, AI Ethics Institute",
    affiliation: "Stanford University",
    featured: true,
  },
  {
    id: "4",
    quote: "Granfar's Five Planes framework is the most practical model for AI-native organizations I've seen. We're implementing it now.",
    name: "James Patterson",
    title: "CEO",
    affiliation: "Nexus Capital",
    featured: true,
  },
  {
    id: "5",
    quote: "A rare combination of systems thinking and moral clarity. This book will define how we think about AI and work for years.",
    name: "Dr. Aisha Patel",
    title: "Head of Research",
    affiliation: "Future of Work Institute",
    featured: true,
  },
  {
    id: "6",
    quote: "The Defensibility Stack alone is worth the price. This is strategic thinking at its finest.",
    name: "Robert Chang",
    title: "Managing Partner",
    affiliation: "Elevation Ventures",
    featured: true,
  },
];

export function BookEndorsements() {
  const [isExpanded, setIsExpanded] = useState(false);
  const featuredEndorsements = endorsements.filter((e) => e.featured);
  const displayedEndorsements = isExpanded ? endorsements : featuredEndorsements;

  return (
    <section id="endorsements" className="bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-4 tracking-tight">
              What People Are Saying
            </h2>
            <p className="font-inter text-lg text-slate-600 dark:text-slate-400">
              Praise from leaders, scholars, and practitioners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1 mb-16">
            <AnimatePresence mode="popLayout">
              {displayedEndorsements.map((endorsement, index) => (
                <motion.div
                  key={endorsement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white dark:bg-black border border-slate-200 dark:border-slate-900 p-8 hover:border-black dark:hover:border-white transition-colors"
                >
                  <p className="font-inter text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    "{endorsement.quote}"
                  </p>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-900">
                    <p className="font-outfit font-bold text-black dark:text-white mb-1">
                      {endorsement.name}
                    </p>
                    <p className="font-inter text-sm text-slate-500 dark:text-slate-500">
                      {endorsement.title}
                    </p>
                    {endorsement.affiliation && (
                      <p className="font-inter text-sm text-slate-400 dark:text-slate-600">
                        {endorsement.affiliation}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 font-outfit text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 transition-colors font-semibold tracking-tight"
            >
              {isExpanded ? "Show Less" : "Show More Endorsements"}
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
