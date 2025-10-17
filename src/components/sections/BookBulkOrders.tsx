"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Package, TrendingUp } from "lucide-react";

import { BulkOrderForm } from "@/components/forms/BulkOrderForm";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

const benefits = [
  {
    icon: Package,
    title: "Flexible Fulfillment",
    description:
      "Coordinate multi-store purchases across retailers for NYT list eligibility",
  },
  {
    icon: MapPin,
    title: "Regional Distribution",
    description:
      "We'll help you distribute orders across locations and retailers",
  },
  {
    icon: TrendingUp,
    title: "Volume Discounts",
    description:
      "Special pricing available for orders of 100+ copies",
  },
  {
    icon: Building2,
    title: "Corporate Programs",
    description:
      "Customized ordering for training programs and book clubs",
  },
];

export function BookBulkOrders() {
  return (
    <Section id="bulk-orders" className="bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900">
      <Container className="py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heading as="h2" className="text-black dark:text-white mb-6">
              Corporate & Bulk Orders
            </Heading>
            <p className="font-inter text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              Equip your entire organization with the blueprint for AI-native transformation.
            </p>

            <div className="space-y-6 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-black dark:text-white" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-semibold text-black dark:text-white mb-1 tracking-tight">
                      {benefit.title}
                    </h3>
                    <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <h4 className="font-outfit font-semibold text-black dark:text-white mb-3 tracking-tight">
                NYT-Friendly Purchasing
              </h4>
              <p className="font-inter text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We can coordinate distributed purchases across multiple retailers and
                locations to ensure your bulk order contributes to bestseller list
                eligibility while meeting your organization's needs.
              </p>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sticky top-8">
              <div className="mb-6">
                <h3 className="font-outfit text-2xl font-semibold text-black dark:text-white mb-2 tracking-tight">
                  Request a Quote
                </h3>
                <p className="font-inter text-slate-600 dark:text-slate-400">
                  Minimum order: 10 copies. We'll contact you within 24-48 hours.
                </p>
              </div>
              <BulkOrderForm />
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
