"use client";

import { motion } from "framer-motion";

const valueProps = [
  {
    title: "First comprehensive blueprint for AI-native enterprise architecture",
    description: "The Five Planes, Defensibility Stack, and governance patterns for organisations where agents are the workforce",
  },
  {
    title: "Synthesises historian's narrative, pragmatist's frameworks, and moralist's call to action",
    description: "From the Industrial Revolution to machine speed—with 200+ citations and real-world case studies",
  },
  {
    title: "Addresses complete transformation stack: technical, social, governance",
    description: "Not just how to build AI-native firms, but how to navigate the human transition with dignity",
  },
  {
    title: "Bridges business strategy and existential questions",
    description: "From the Cognitive Overhead Index to the economy of being—pragmatic tools meet moral urgency",
  },
  {
    title: "Offers pragmatic hope, not naive optimism",
    description: "A bracingly honest path from extraction to stewardship, workism to purpose, narrow profit to shared prosperity",
  },
];

export function BookOverview() {
  return (
    <section id="overview" className="bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-start max-w-7xl mx-auto">
          {/* Left: Main copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-8 tracking-tight">
              What This Book Is
            </h2>
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none space-y-6">
              <p className="font-inter text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                We are witnessing a lineage break as profound as the Industrial Revolution—but this time, it's happening at machine speed. A three-person team now orchestrates the productive capacity that once required 30,000 employees. AI agents don't just assist with work; they <em>are</em> the workforce, executing, learning, and adapting faster than any human organisation ever could.
              </p>
              <p className="font-inter text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                This is not another book about AI tools or incremental efficiency gains. <strong className="text-black dark:text-white font-semibold">AI-Born</strong> is the definitive blueprint for the new architecture of enterprise—and a bracingly honest manifesto for the human transition it demands. Part field manual, part historical reckoning, part moral call to arms, it reveals how we got trapped in the cage of "workism," why this technological rupture is different from all others, and how we can build an economy that moves from extraction to stewardship, from narrow profit to shared prosperity.
              </p>
              <p className="font-inter text-lg text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong className="text-black dark:text-white font-semibold">The machines will scale the <em>how</em>. The question that remains is whether we're wise enough to choose a <em>why</em> worthy of the power we now wield.</strong>
              </p>
            </div>
          </motion.div>

          {/* Right: Value props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-1"
          >
            {valueProps.map((prop, index) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="border-l-2 border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white pl-6 py-5 transition-colors duration-300"
              >
                <h3 className="font-outfit font-bold text-black dark:text-white mb-2 text-lg tracking-tight">
                  {prop.title}
                </h3>
                <p className="font-inter text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {prop.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
