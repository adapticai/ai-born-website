"use client";

import { BookNavbar } from "@/components/BookNavbar";
import { BookFooter } from "@/components/sections/BookFooter";

export default function PrivacyPage() {
  return (
    <>
      <BookNavbar />
      <main className="min-h-screen bg-white pt-24 dark:bg-black">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <h1 className="font-outfit text-5xl font-extrabold tracking-tight text-black dark:text-white mb-8">
              Privacy Policy
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              1. Information We Collect
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Name and email address when you sign up for our newsletter or request a free excerpt</li>
              <li>Information submitted through contact forms for media inquiries, speaking requests, or bulk orders</li>
              <li>Proof of purchase information when claiming pre-order bonuses</li>
            </ul>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              2. How We Use Your Information
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Send you the free excerpt, pre-order bonus materials, and book launch updates</li>
              <li>Respond to your inquiries and requests</li>
              <li>Send you newsletters and marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              3. Information Sharing
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We do not sell, rent, or share your personal information with third parties except:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>With service providers who assist us in operating our website and delivering services (e.g., email delivery services)</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              4. Cookies & Analytics
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We use cookies and similar tracking technologies to analyze website traffic and improve user experience. We use privacy-friendly analytics that do not track personal information across websites. You can control cookies through your browser settings.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              5. Your Rights
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Access, update, or delete your personal information</li>
              <li>Unsubscribe from our emails at any time via the unsubscribe link</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of the data we hold about you</li>
              <li>Object to processing of your personal information</li>
            </ul>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              6. Data Security
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              7. Data Retention
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law. You may request deletion of your data at any time.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              8. Children's Privacy
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Our services are not directed to children under 16. We do not knowingly collect personal information from children under 16. If you become aware that a child has provided us with personal information, please contact us.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              9. International Data Transfers
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              10. Changes to This Policy
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="font-outfit text-3xl font-bold tracking-tight text-black dark:text-white mt-12 mb-6">
              11. Contact Us
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              If you have questions about this Privacy Policy or our data practices, please contact us at{" "}
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
