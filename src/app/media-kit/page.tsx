import { BookNavbar } from "@/components/BookNavbar";
import { BookFooter } from "@/components/sections/BookFooter";
import { Download, FileText, Image as ImageIcon, Users } from "lucide-react";

export const metadata = {
  title: "Media Kit — AI-Born",
  description: "Press materials, author bio, book assets, and media contact information for AI-Born by Mehran Granfar.",
};

const pressKitAssets = [
  {
    icon: FileText,
    title: "One-Page Synopsis",
    format: "PDF",
    description: "Concise book overview for media",
  },
  {
    icon: FileText,
    title: "Press Release",
    format: "PDF",
    description: "Launch announcement",
  },
  {
    icon: ImageIcon,
    title: "Cover Art (High-Res)",
    format: "ZIP",
    description: "Print and digital cover images",
  },
  {
    icon: Users,
    title: "Author Headshots",
    format: "ZIP",
    description: "Multiple poses and formats",
  },
  {
    icon: FileText,
    title: "Chapter List",
    format: "PDF",
    description: "Complete table of contents",
  },
  {
    icon: FileText,
    title: "Selected Excerpts",
    format: "PDF",
    description: "Key passages for review",
  },
];

export default function MediaKitPage() {
  return (
    <>
      <BookNavbar />
      <main className="min-h-screen bg-white pt-24 dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-16">
              <h1 className="font-outfit text-5xl md:text-6xl font-extrabold text-black dark:text-white mb-6 tracking-tight">
                Media Kit
              </h1>
              <p className="font-inter text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                Press materials, author bio, book assets, and media contact information for <strong className="text-black dark:text-white">AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being</strong> by Mehran Granfar—the definitive blueprint for AI-native organisations and manifesto for the human transition ahead.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-20 flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-outfit font-semibold tracking-tight transition-colors rounded-none">
                <Download className="w-5 h-5 inline mr-2" />
                Download Complete Press Kit
              </button>
              <a
                href="mailto:press@micpress.com"
                className="px-8 py-4 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-outfit font-semibold tracking-tight transition-colors rounded-none text-center"
              >
                Contact Press Team
              </a>
            </div>

            {/* About the Book */}
            <section className="mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
              <h2 className="font-outfit text-3xl font-extrabold text-black dark:text-white mb-8 tracking-tight">
                About the Book
              </h2>
              <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                <p className="font-inter text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  We are witnessing a lineage break as profound as the Industrial Revolution—but this time, it's happening at machine speed. A three-person team now orchestrates the productive capacity that once required 30,000 employees. AI agents don't just assist with work; they <em>are</em> the workforce, executing, learning, and adapting faster than any human organization ever could.
                </p>
                <p className="font-inter text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  This is not another book about AI tools or incremental efficiency gains. <strong className="text-black dark:text-white">AI-Born</strong> is the definitive blueprint for the new architecture of enterprise—and a bracingly honest manifesto for the human transition it demands. Part field manual, part historical reckoning, part moral call to arms, it reveals how we got trapped in the cage of "workism," why this technological rupture is different from all others, and how we can build an economy that moves from extraction to stewardship, from narrow profit to shared prosperity.
                </p>
                <p className="font-inter text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-black dark:text-white">The machines will scale the <em>how</em>. The question that remains is whether we're wise enough to choose a <em>why</em> worthy of the power we now wield.</strong>
                </p>
              </div>
            </section>

            {/* Author Bio */}
            <section className="mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
              <h2 className="font-outfit text-3xl font-extrabold text-black dark:text-white mb-8 tracking-tight">
                About the Author
              </h2>
              <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                <p className="font-inter text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  <strong className="text-black dark:text-white">Mehran Granfar</strong> is the Founder and CEO of <strong className="text-black dark:text-white">Adaptic.ai</strong>, the world's first <em>AI-born</em> company—an institutional platform built from first principles to integrate autonomous intelligence into the fabric of modern finance. A systems architect, strategic advisor, and technology futurist, he works at the frontier where artificial intelligence, organizational design, and economic architecture converge.
                </p>
                <p className="font-inter text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  With a background spanning enterprise technology, venture capital, and corporate strategy, Granfar has advised Fortune 500 firms, sovereign institutions, and emerging ventures on how to evolve from <em>AI-enabled</em> to <em>AI-native</em>. His work explores how governance, autonomy, and intelligence can coexist in complex systems—where algorithms don't just assist decision-makers, but <em>become</em> part of the institution itself.
                </p>
                <p className="font-inter text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Drawing from computer science, economic history, and systems philosophy, Granfar's writing examines how intelligent systems are quietly rewriting the social contract—reshaping what we mean by work, value, and even organization. A frequent speaker on the future of work and machine governance, he combines technical fluency with humanistic depth to illuminate what it means to build in the age of autonomous intelligence.
                </p>
              </div>
            </section>

            {/* Press Kit Assets */}
            <section className="mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
              <h2 className="font-outfit text-3xl font-extrabold text-black dark:text-white mb-8 tracking-tight">
                Press Kit Assets
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1">
                {pressKitAssets.map((asset) => (
                  <div
                    key={asset.title}
                    className="border border-slate-200 dark:border-slate-800 p-8 hover:border-black dark:hover:border-white transition-colors cursor-pointer bg-white dark:bg-black"
                  >
                    <div className="w-12 h-12 border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-4">
                      <asset.icon className="w-6 h-6 text-black dark:text-white" />
                    </div>
                    <h3 className="font-outfit font-bold text-black dark:text-white mb-2 tracking-tight">
                      {asset.title}
                    </h3>
                    <p className="font-inter text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {asset.description}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {asset.format}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Key Selling Points */}
            <section className="mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
              <h2 className="font-outfit text-3xl font-extrabold text-black dark:text-white mb-8 tracking-tight">
                Key Selling Points
              </h2>
              <ul className="space-y-4">
                {[
                  "First comprehensive blueprint for AI-native enterprise architecture",
                  "Synthesizes historian's narrative, pragmatist's frameworks, and moralist's call to action",
                  "Addresses complete transformation stack: technical, social, governance",
                  "Bridges business strategy and existential questions",
                  "Grounded in 200+ citations and real-world case studies",
                  "Offers pragmatic hope, not naive optimism",
                  "Introduces new lexicon for the AI era",
                  "Timely and urgent—arrives at the inflection point"
                ].map((point, index) => (
                  <li key={index} className="flex gap-4 items-start">
                    <span className="font-outfit text-2xl font-bold text-slate-300 dark:text-slate-700 tracking-tight flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-inter text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Contact Information */}
            <section className="border-t border-slate-200 dark:border-slate-800 pt-16">
              <h2 className="font-outfit text-3xl font-extrabold text-black dark:text-white mb-8 tracking-tight">
                Media Contact
              </h2>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
                <div className="space-y-4">
                  <div>
                    <p className="font-outfit font-bold text-black dark:text-white mb-1">
                      Press Inquiries
                    </p>
                    <a
                      href="mailto:press@micpress.com"
                      className="font-inter text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                    >
                      press@micpress.com
                    </a>
                  </div>
                  <div>
                    <p className="font-outfit font-bold text-black dark:text-white mb-1">
                      Speaking Engagements
                    </p>
                    <a
                      href="mailto:partnerships@micpress.com"
                      className="font-inter text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                    >
                      partnerships@micpress.com
                    </a>
                  </div>
                  <div>
                    <p className="font-outfit font-bold text-black dark:text-white mb-1">
                      Publisher
                    </p>
                    <p className="font-inter text-slate-700 dark:text-slate-300">
                      Mic Press, Inc.
                      <br />
                      <a
                        href="https://micpress.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                      >
                        micpress.com
                      </a>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                      For urgent media inquiries, we typically respond within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <BookFooter />
    </>
  );
}
