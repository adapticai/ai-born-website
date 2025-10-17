"use client";

import { motion } from "framer-motion";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What formats is AI-Born available in?",
    answer: "AI-Born is available in hardcover, eBook (Kindle, Apple Books, Google Play), and audiobook formats. Pre-order from your preferred retailer.",
  },
  {
    question: "When will the book be released?",
    answer: "The official release date will be announced soon. Pre-order now to be among the first to receive your copy and claim the exclusive Agent Charter Pack bonus.",
  },
  {
    question: "How do pre-orders work?",
    answer: "Pre-order from any major retailer (Amazon, Barnes & Noble, Bookshop.org, Apple Books, etc.). You'll be charged when the book ships. Save your receipt to claim your bonus pack.",
  },
  {
    question: "What's included in the Agent Charter Pack?",
    answer: "The bonus pack includes VP-agent templates, sub-agent organisational ladders, escalation/override protocols, and a mini Cognitive Overhead Index diagnostic tool—practical resources for implementing AI-native governance.",
  },
  {
    question: "How do I claim my pre-order bonus?",
    answer: "After pre-ordering from any retailer, upload your receipt through the bonus claim form on this page. You'll receive your Agent Charter Pack via email within 24 hours.",
  },
  {
    question: "Is the free excerpt the same as the bonus pack?",
    answer: "No. The free excerpt is a chapter from the book available to anyone. The Agent Charter Pack is an exclusive bonus for pre-order customers only, containing practical implementation templates.",
  },
  {
    question: "Can I order bulk copies for my organisation?",
    answer: "Yes! For bulk orders (10+ copies), please use the corporate orders form. We can coordinate distributed purchasing across multiple retailers for NYT list eligibility.",
  },
  {
    question: "How can media request a review copy?",
    answer: "Media professionals can request a galley or book an interview through the 'For Media & Partners' section below. We typically respond within 24-48 hours.",
  },
];

export function BookFAQ() {
  return (
    <section id="faq" className="bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-black dark:text-white text-center mb-16 tracking-tight">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-1">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white dark:bg-black border border-slate-200 dark:border-slate-900 px-8 py-2 data-[state=open]:border-black dark:data-[state=open]:border-white"
              >
                <AccordionTrigger className="font-outfit font-bold text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 transition-colors text-left tracking-tight">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-inter text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
