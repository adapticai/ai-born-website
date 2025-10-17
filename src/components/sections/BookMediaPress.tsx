"use client";

import { motion } from "framer-motion";
import { Download, FileText, Image, Mail, Users, Video } from "lucide-react";

import { CTAButton } from "@/components/CTAButton";
import { MediaRequestForm } from "@/components/forms/MediaRequestForm";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

const pressKitAssets = [
  {
    icon: FileText,
    title: "One-Page Synopsis",
    format: "PDF",
    size: "240 KB",
    description: "Concise book overview for media",
  },
  {
    icon: FileText,
    title: "Press Release",
    format: "PDF",
    size: "180 KB",
    description: "Launch announcement (embargo-capable)",
  },
  {
    icon: Image,
    title: "Cover Art (High-Res)",
    format: "ZIP",
    size: "12 MB",
    description: "Print and digital cover images",
  },
  {
    icon: Users,
    title: "Author Headshots",
    format: "ZIP",
    size: "8 MB",
    description: "Multiple poses and formats",
  },
  {
    icon: FileText,
    title: "Chapter List",
    format: "PDF",
    size: "120 KB",
    description: "Complete table of contents",
  },
  {
    icon: FileText,
    title: "Selected Excerpts",
    format: "PDF",
    size: "450 KB",
    description: "Key passages for review",
  },
  {
    icon: Video,
    title: "Interview Topics",
    format: "PDF",
    size: "150 KB",
    description: "Suggested discussion themes",
  },
  {
    icon: Image,
    title: "Brand Assets",
    format: "ZIP",
    size: "3 MB",
    description: "Logos and visual identity",
  },
];

export function BookMediaPress() {
  const handleDownloadAll = () => {
    // Track analytics
    window.dataLayer?.push({
      event: "presskit_download",
      asset_type: "complete_kit",
    });
    // TODO: Implement ZIP generation and download
    console.log("Download complete press kit");
  };

  const handleDownloadAsset = (asset: string) => {
    window.dataLayer?.push({
      event: "presskit_download",
      asset_type: asset,
    });
    // TODO: Implement individual asset download
    console.log(`Download asset: ${asset}`);
  };

  return (
    <Section id="media" className="bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900">
      <Container className="py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <Heading as="h2" className="text-black dark:text-white mb-4">
            For Media & Partners
          </Heading>
          <p className="font-inter text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Press kit, speaking requests, and interview topics
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <CTAButton
            ctaId="presskit-download-all"
            variant="primary"
            onClick={handleDownloadAll}
            eventData={{
              event: "presskit_download",
              asset_type: "complete_kit",
            }}
            className="rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Complete Press Kit
          </CTAButton>
          <CTAButton
            ctaId="media-email"
            variant="outline"
            onClick={() => (window.location.href = "mailto:press@micpress.com")}
            className="rounded-none border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            eventData={{
              event: "media_email_click",
            }}
          >
            <Mail className="w-5 h-5 mr-2" />
            Email Press Team
          </CTAButton>
        </div>

        {/* Press Kit Assets Grid */}
        <div className="mb-16">
          <h3 className="font-outfit text-2xl font-semibold text-black dark:text-white mb-8 text-center tracking-tight">
            Individual Assets
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1">
            {pressKitAssets.map((asset, index) => (
              <motion.div
                key={asset.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white dark:bg-black border border-slate-200 dark:border-slate-900 p-6 hover:border-black dark:hover:border-white transition-all group cursor-pointer"
                onClick={() => handleDownloadAsset(asset.title)}
              >
                <div className="w-12 h-12 border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:border-black dark:group-hover:border-white transition-colors">
                  <asset.icon className="w-6 h-6 text-black dark:text-white" />
                </div>
                <h4 className="font-outfit font-semibold text-black dark:text-white mb-2 tracking-tight">
                  {asset.title}
                </h4>
                <p className="font-inter text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {asset.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                  <span>{asset.format}</span>
                  <span>{asset.size}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Media Request Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
            <div className="text-center mb-8">
              <Heading as="h3" className="text-black dark:text-white mb-3">
                Request a Galley or Book an Interview
              </Heading>
              <p className="font-inter text-slate-600 dark:text-slate-400">
                We typically respond within 24-48 hours
              </p>
            </div>
            <MediaRequestForm />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="font-inter text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            For urgent media inquiries, please contact{" "}
            <a
              href="mailto:press@micpress.com"
              className="text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-300 underline"
            >
              press@micpress.com
            </a>
            . Speaking engagements and partnership opportunities:{" "}
            <a
              href="mailto:partnerships@micpress.com"
              className="text-black dark:text-white hover:text-slate-600 dark:hover:text-slate-300 underline"
            >
              partnerships@micpress.com
            </a>
          </p>
        </div>
      </Container>
    </Section>
  );
}
