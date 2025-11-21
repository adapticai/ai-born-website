/**
 * Agent Charter Pack Page
 *
 * Showcases the Agent Charter Pack bonus content with two states:
 * 1. Entitled users: Full download access to all bonus materials
 * 2. Non-entitled users: Beautiful preview with CTA to pre-order
 *
 * Features:
 * - Authentication required via requireAuth()
 * - Entitlement check using hasEntitlement()
 * - Download tracking with analytics
 * - Card-based layout using shadcn/ui
 * - Brand design system integration
 * - Fully responsive
 * - Navbar and footer integration
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
  Download,
  FileText,
  Gift,
  Sparkles,
  CheckCircle2,
  Lock,
  Upload,
  ChevronRight,
} from 'lucide-react';

import { requireAuth, getUserEntitlements } from '@/lib/auth';
import { BookNavbarWrapper } from '@/components/BookNavbarWrapper';
import { BookFooter } from '@/components/sections/BookFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RetailerMenu } from '@/components/RetailerMenu';
import { trackDownload } from '@/lib/analytics';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Agent Charter Pack | AI-Born',
  description:
    'VP-agent templates, sub-agent ladders, escalation protocols, and the Cognitive Overhead Index diagnostic tool. Pre-order bonus for AI-Born.',
  robots: {
    index: false, // Don't index authenticated pages
    follow: false,
  },
};

// ============================================================================
// Bonus Item Definitions
// ============================================================================

interface BonusItem {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  downloadUrl: string;
  fileSize: string;
  fileFormat: string;
  previewImage?: string;
  benefits: string[];
}

const bonusItems: BonusItem[] = [
  {
    id: 'agent-charter-pack',
    title: 'Agent Charter Pack',
    description:
      'Complete VP-agent templates, sub-agent ladders, and escalation protocols for autonomous agent deployment.',
    icon: FileText,
    downloadUrl: '/api/bonus/download/charter-pack',
    fileSize: '2.4 MB',
    fileFormat: 'PDF',
    benefits: [
      'Ready-to-use VP-agent charters for common organisational functions',
      'Sub-agent hierarchy templates for complex workflows',
      'Escalation and override protocols with real-world examples',
      'Decision rights mapping frameworks',
      'Governance checkpoints and audit trails',
    ],
  },
  {
    id: 'coi-diagnostic',
    title: 'COI Diagnostic Tool',
    description:
      'Interactive spreadsheet to calculate your Cognitive Overhead Index and identify institutional drag.',
    icon: Sparkles,
    downloadUrl: '/api/bonus/download/coi-diagnostic',
    fileSize: '1.8 MB',
    fileFormat: 'XLSX',
    benefits: [
      'Calculate your organisation\'s COI score in under 20 minutes',
      'Identify high-friction decision points and approval bottlenecks',
      'Benchmark against industry averages by sector',
      'Generate prioritised recommendations for reducing overhead',
      'Track COI reduction over time with built-in dashboards',
    ],
  },
  {
    id: 'vp-agent-templates',
    title: 'VP-Agent Templates',
    description:
      'Production-ready templates for deploying VP-level autonomous agents across your organisation.',
    icon: Gift,
    downloadUrl: '/api/bonus/download/vp-templates',
    fileSize: '3.2 MB',
    fileFormat: 'ZIP',
    benefits: [
      'Department-specific templates (Finance, HR, Operations, Product)',
      'Authority matrix and delegation frameworks',
      'Integration playbooks for common enterprise systems',
      'Performance metrics and KPI dashboards',
      'Change management guides for stakeholder onboarding',
    ],
  },
];

// ============================================================================
// What's Included Section Data
// ============================================================================

const whatsIncludedSections = [
  {
    id: 'charter-pack',
    title: 'Agent Charter Pack',
    description:
      'The foundational toolkit for designing and deploying autonomous agents with clear authority boundaries, escalation paths, and governance safeguards.',
    items: [
      'VP-agent charter templates for Finance, HR, Operations, and Product',
      'Sub-agent hierarchy frameworks for complex multi-step workflows',
      'Escalation protocols with real-world decision trees',
      'Override mechanisms for human intervention when needed',
      'Audit trail requirements and compliance checklists',
    ],
  },
  {
    id: 'coi-tool',
    title: 'Cognitive Overhead Index (COI) Diagnostic',
    description:
      'An interactive diagnostic tool to quantify institutional drag, identify friction points, and track progress in reducing cognitive overhead across your organisation.',
    items: [
      'Step-by-step assessment guide (15–20 minutes to complete)',
      'Automated COI score calculation with percentile benchmarking',
      'Heatmap visualisation of decision bottlenecks by department',
      'Prioritised recommendations for reducing overhead',
      'Quarterly tracking dashboard to measure improvement',
    ],
  },
  {
    id: 'implementation',
    title: 'VP-Agent Implementation Templates',
    description:
      'Production-ready templates, integration guides, and change management frameworks to accelerate your transition from AI-enabled to AI-born.',
    items: [
      'Department-specific agent deployment playbooks',
      'Authority matrix templates defining decision rights',
      'System integration guides for common enterprise platforms',
      'Performance metrics and KPI tracking dashboards',
      'Stakeholder communication templates and onboarding guides',
    ],
  },
];

// ============================================================================
// Download Button Component (Client-side tracking)
// ============================================================================

function DownloadButton({ item }: { item: BonusItem }) {
  const Icon = item.icon;

  const handleDownload = () => {
    // Track download event
    trackDownload(item.title, item.fileFormat);
  };

  return (
    <Button asChild className="w-full font-semibold" onClick={handleDownload}>
      <a href={item.downloadUrl} download>
        <Download className="h-4 w-4" />
        Download {item.fileFormat}
      </a>
    </Button>
  );
}

// ============================================================================
// Entitled State: Full Access to Downloads
// ============================================================================

function EntitledView() {
  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-brand-cyan/10 via-white to-brand-ember/10 py-20 dark:border-slate-900 dark:from-brand-cyan/5 dark:via-brand-obsidian dark:to-brand-ember/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="default"
              className="mb-6 bg-gradient-to-r from-brand-cyan to-brand-ember px-4 py-2 text-sm font-semibold text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Pack Unlocked</span>
            </Badge>

            <h1 className="font-outfit mb-6 text-5xl font-extrabold tracking-tight text-black sm:text-6xl lg:text-7xl dark:text-white">
              Agent Charter Pack
            </h1>

            <p className="font-inter mb-8 text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400">
              Your exclusive pre-order bonus is ready to download. Get immediate access to
              VP-agent templates, COI diagnostics, and implementation frameworks.
            </p>
          </div>
        </div>
      </section>

      {/* Download Cards Section */}
      <section className="border-b border-slate-200 bg-white py-20 dark:border-slate-900 dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-outfit mb-4 text-3xl font-bold tracking-tight text-black sm:text-4xl dark:text-white">
                Download Your Pack
              </h2>
              <p className="font-inter text-lg text-slate-600 dark:text-slate-400">
                Three comprehensive toolkits to accelerate your AI-native transformation
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {bonusItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden border-slate-200 bg-white transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-cyan to-brand-ember opacity-0 transition-opacity group-hover:opacity-100" />

                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan/10 to-brand-ember/10 dark:from-brand-cyan/20 dark:to-brand-ember/20">
                        <Icon className="h-6 w-6 text-brand-cyan dark:text-brand-cyan" />
                      </div>

                      <CardTitle className="font-outfit text-xl font-bold text-black dark:text-white">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="font-inter text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                        <FileText className="h-4 w-4" />
                        <span>{item.fileSize}</span>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <DownloadButton item={item} />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 rounded-2xl border border-brand-cyan/20 bg-gradient-to-r from-brand-cyan/5 to-brand-ember/5 p-8 text-center dark:border-brand-cyan/10">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-brand-cyan" />
              <h3 className="font-outfit mb-2 text-xl font-bold text-black dark:text-white">
                Pack Successfully Claimed
              </h3>
              <p className="font-inter text-slate-600 dark:text-slate-400">
                You have lifetime access to all materials. Updates and additions will be sent to
                your email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Accordion */}
      <section className="bg-slate-50 py-20 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="font-outfit mb-4 text-3xl font-bold tracking-tight text-black sm:text-4xl dark:text-white">
                What's Included
              </h2>
              <p className="font-inter text-lg text-slate-600 dark:text-slate-400">
                Production-ready tools to fast-track your transition to AI-native operations
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {whatsIncludedSections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="rounded-xl border border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-black"
                >
                  <AccordionTrigger className="font-outfit text-lg font-semibold text-black hover:text-brand-cyan hover:no-underline dark:text-white dark:hover:text-brand-cyan">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <p className="font-inter text-slate-600 dark:text-slate-400">
                        {section.description}
                      </p>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="font-inter flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-cyan" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-900 dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-outfit mb-6 text-3xl font-bold tracking-tight text-black sm:text-4xl dark:text-white">
              Start Using Your Pack
            </h2>
            <p className="font-inter mb-8 text-lg text-slate-600 dark:text-slate-400">
              All materials are production-ready. Begin your AI-native transformation today.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-black px-8 py-6 text-base font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
              >
                <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <Download className="h-5 w-5" />
                  View Downloads
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base">
                <Link href="/downloads">All Downloads</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================================
// Non-Entitled State: Preview with CTA
// ============================================================================

function NonEntitledView() {
  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-brand-cyan/10 via-white to-brand-ember/10 py-20 dark:border-slate-900 dark:from-brand-cyan/5 dark:via-brand-obsidian dark:to-brand-ember/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 border-brand-ember/30 px-4 py-2 text-sm">
              <Lock className="h-4 w-4 text-brand-ember" />
              <span className="text-brand-ember">Pre-order Required</span>
            </Badge>

            <h1 className="font-outfit mb-6 text-5xl font-extrabold tracking-tight text-black sm:text-6xl lg:text-7xl dark:text-white">
              Agent Charter Pack
            </h1>

            <p className="font-inter mb-8 text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400">
              Pre-order AI-Born to unlock exclusive bonus materials worth £297. Includes
              production-ready templates, diagnostic tools, and implementation guides.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-black px-8 py-6 text-base font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
              >
                <Link href="/bonus-claim">
                  <Upload className="h-5 w-5" />
                  Claim Your Pack
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-300 px-8 py-6 text-base font-semibold dark:border-slate-700"
              >
                <a href="#overview">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Unlock Section */}
      <section className="border-b border-slate-200 bg-white py-20 dark:border-slate-900 dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white to-slate-50 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
              <CardHeader className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-ember/20">
                  <Gift className="h-10 w-10 text-brand-cyan dark:text-brand-cyan" />
                </div>
                <CardTitle className="font-outfit mb-4 text-3xl font-bold text-black dark:text-white">
                  Unlock the Agent Charter Pack
                </CardTitle>
                <CardDescription className="font-inter text-base text-slate-600 dark:text-slate-400">
                  Pre-order AI-Born from any retailer and claim your exclusive bonus worth £297
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-cyan text-sm font-bold text-white">
                      1
                    </div>
                    <div>
                      <h4 className="font-outfit mb-1 font-semibold text-black dark:text-white">
                        Pre-order the book
                      </h4>
                      <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                        Order from any retailer (Amazon, Barnes & Noble, Bookshop.org, etc.)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-cyan text-sm font-bold text-white">
                      2
                    </div>
                    <div>
                      <h4 className="font-outfit mb-1 font-semibold text-black dark:text-white">
                        Upload proof of purchase
                      </h4>
                      <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                        Submit your receipt or order confirmation screenshot
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-ember text-sm font-bold text-white">
                      3
                    </div>
                    <div>
                      <h4 className="font-outfit mb-1 font-semibold text-black dark:text-white">
                        Get instant access
                      </h4>
                      <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                        Download all materials immediately after verification (usually within 24
                        hours)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-black px-8 py-6 text-base font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
                >
                  <Link href="/bonus-claim">
                    <Upload className="h-5 w-5" />
                    Claim Your Pack
                  </Link>
                </Button>
                <p className="font-inter text-center text-xs text-slate-500 dark:text-slate-600">
                  Available to all pre-order customers, regardless of retailer or format
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section id="overview" className="bg-slate-50 py-20 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="font-outfit mb-4 text-3xl font-bold tracking-tight text-black sm:text-4xl dark:text-white">
                What's Included
              </h2>
              <p className="font-inter text-lg text-slate-600 dark:text-slate-400">
                Production-ready tools to fast-track your transition to AI-native operations
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {whatsIncludedSections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="rounded-xl border border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-black"
                >
                  <AccordionTrigger className="font-outfit text-lg font-semibold text-black hover:text-brand-cyan hover:no-underline dark:text-white dark:hover:text-brand-cyan">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <p className="font-inter text-slate-600 dark:text-slate-400">
                        {section.description}
                      </p>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="font-inter flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-cyan" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 rounded-2xl border border-brand-ember/20 bg-gradient-to-r from-brand-ember/5 to-brand-cyan/5 p-8 text-center dark:border-brand-ember/10">
              <p className="font-outfit text-2xl font-bold text-black dark:text-white">
                Total Value: £297
              </p>
              <p className="font-inter mt-2 text-slate-600 dark:text-slate-400">
                Included free with every pre-order
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-900 dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-outfit mb-6 text-3xl font-bold tracking-tight text-black sm:text-4xl dark:text-white">
              Ready to Get Started?
            </h2>
            <p className="font-inter mb-8 text-lg text-slate-600 dark:text-slate-400">
              Pre-order AI-Born today and unlock instant access to these exclusive materials.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-black px-8 py-6 text-base font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
              >
                <Link href="/bonus-claim">
                  <Upload className="h-5 w-5" />
                  Claim Your Pack
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base">
                <Link href="/#hero">Pre-order Book</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function BonusPackPage() {
  // Require authentication
  const user = await requireAuth('/bonus-pack');

  // Get user entitlements
  const entitlements = await getUserEntitlements(user.id);

  // Check if user has Agent Charter Pack entitlement
  const hasAccess = entitlements.hasAgentCharterPack;

  return (
    <>
      <BookNavbarWrapper />
      <main className="pt-16">
        {hasAccess ? <EntitledView /> : <NonEntitledView />}
      </main>
      <BookFooter />
    </>
  );
}
