"use client";

import { motion } from "framer-motion";

export function BookAuthor() {
  return (
    <section id="author" className="bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
          {/* Left: Author Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="w-72 h-72 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-black flex items-center justify-center shadow-2xl">
                <div className="text-8xl font-outfit font-extrabold text-black dark:text-white tracking-tighter">MG</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Bio */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-8 tracking-tight">
              About the Author
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 font-inter leading-relaxed text-lg">
              <p>
                <strong className="text-black dark:text-white font-semibold">Mehran Granfar</strong> is the Founder and CEO of <strong className="text-black dark:text-white font-semibold">Adaptic.ai</strong>, the world's first <em>AI-born</em> company—an institutional platform built from first principles to integrate autonomous intelligence into the fabric of modern finance. A systems architect, strategic advisor, and technology futurist, he works at the frontier where artificial intelligence, organisational design, and economic architecture converge.
              </p>
              <p>
                With a background spanning enterprise technology, venture capital, and corporate strategy, Granfar has advised Fortune 500 firms, sovereign institutions, and emerging ventures on how to evolve from <em>AI-enabled</em> to <em>AI-native</em>. His work explores how governance, autonomy, and intelligence can coexist in complex systems—where algorithms don't just assist decision-makers, but <em>become</em> part of the institution itself.
              </p>
              <p>
                Drawing from computer science, economic history, and systems philosophy, Granfar's writing examines how intelligent systems are quietly rewriting the social contract—reshaping what we mean by work, value, and even organisation. A frequent speaker on the future of work and machine governance, he combines technical fluency with humanistic depth to illuminate what it means to build in the age of autonomous intelligence.
              </p>
            </div>
            <div className="mt-10">
              <button className="font-outfit px-8 py-4 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-semibold tracking-tight transition-colors rounded-none">
                Download full bio + headshots
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
