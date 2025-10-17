"use client";

import { BookNavbar } from "@/components/BookNavbar";
import { BookFooter } from "@/components/sections/BookFooter";

export default function TermsPage() {
  return (
    <>
      <BookNavbar />
      <main className="min-h-screen bg-white pt-24 dark:bg-black">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <h1 className="font-outfit text-5xl font-extrabold tracking-tight text-black dark:text-white mb-8">
              Terms of Service
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              By accessing and using this website (ai-born.org), you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              2. Use License
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Permission is granted to temporarily access the materials (information or software) on ai-born.org for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              3. Content & Intellectual Property
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              All content on this website, including text, graphics, logos, images, and software, is the property of Mic Press, LLC. or its content suppliers and is protected by international copyright laws. The book "AI-Born" and all related materials are protected by copyright and other intellectual property rights.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              4. Pre-Orders & Purchases
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Pre-orders placed through third-party retailers are subject to those retailers' terms and conditions. Mic Press, LLC. is not responsible for fulfillment, refunds, or customer service for purchases made through external retailers.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              5. Email Communications
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              By providing your email address, you consent to receive email communications from Mic Press, LLC. regarding book updates, launches, and related content. You may unsubscribe at any time via the link provided in each email.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              6. Disclaimer
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              The materials on ai-born.org are provided on an 'as is' basis. Mic Press, LLC. makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              7. Limitations
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              In no event shall Mic Press, LLC. or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ai-born.org.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              8. Governing Law
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              9. Changes to Terms
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Mic Press, LLC. may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these terms of service.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              10. Contact Information
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:info@micpress.com" className="text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 underline transition-colors">
                info@micpress.com
              </a>
            </p>
          </article>
        </section>
      </main>
      <BookFooter />
    </>
  );
}
