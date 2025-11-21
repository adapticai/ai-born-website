"use client";

import { Instagram, Linkedin, Youtube, Mail, User, Download, Gift, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { CookieSettingsButton } from "@/components/CookieConsent";
import { EmailCaptureForm } from "@/components/forms/EmailCaptureForm";
import { MicPressLogo } from "@/components/icons/MicPressLogo";
import { RetailerMenu } from "@/components/RetailerMenu";
import { formatUserDisplayName } from "@/lib/auth";

export function BookFooter() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const isLoading = status === "loading";

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-900 dark:bg-black">
      {/* Newsletter Section - Only show if not authenticated */}
      {!isAuthenticated && !isLoading && (
        <div className="border-b border-slate-200 bg-white py-20 dark:border-slate-900 dark:bg-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="font-outfit mb-4 text-3xl font-extrabold tracking-tight text-black dark:text-white">
                Stay Updated
              </h3>
              <p className="font-inter mb-8 text-slate-600 dark:text-slate-400">
                Get the free excerpt + launch invites
              </p>
              <div className="mx-auto max-w-md">
                <EmailCaptureForm source="newsletter-footer" />
              </div>
              <p className="font-inter mt-4 text-xs text-slate-500 dark:text-slate-600">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authenticated User Welcome */}
      {isAuthenticated && session?.user && (
        <div className="border-b border-slate-200 bg-gradient-to-r from-brand-cyan/5 to-brand-ember/5 py-12 dark:border-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-outfit mb-2 text-lg font-semibold text-black dark:text-white">
                Welcome back, {formatUserDisplayName(session.user)}
              </p>
              <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                Access your downloads, bonus content, and account settings below
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mx-auto mb-12 grid max-w-7xl gap-8 lg:gap-12 ${isAuthenticated ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
            {/* Column 1: Pre-order (Retailer Links) */}
            <div>
              <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                Pre-order
              </h4>
              <div className="mb-6">
                <RetailerMenu
                  triggerText="See All Retailers"
                  triggerVariant="primary"
                  originSection="footer"
                  className="font-outfit w-full rounded-none bg-black px-4 py-2.5 text-xs font-semibold tracking-tight text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
                />
              </div>
              <ul className="font-inter space-y-2 text-sm">
                <li>
                  <a
                    href="#overview"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    What's Inside
                  </a>
                </li>
                <li>
                  <a
                    href="#frameworks"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Key Frameworks
                  </a>
                </li>
                <li>
                  <a
                    href="#excerpt"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Free Excerpt
                  </a>
                </li>
                <li>
                  <a
                    href="#endorsements"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Endorsements
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: My Account (Authenticated Only) */}
            {isAuthenticated && (
              <div>
                <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                  My Account
                </h4>
                <ul className="font-inter space-y-2 text-sm">
                  <li>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/downloads"
                      className="flex items-center gap-2 text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      <span>Downloads</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/bonus-claim"
                      className="flex items-center gap-2 text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                    >
                      <Gift className="h-4 w-4" aria-hidden="true" />
                      <span>Claim Bonus</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      <span>Settings</span>
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Column 3: Resources */}
            <div>
              <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                Resources
              </h4>
              <ul className="font-inter space-y-2 text-sm">
                <li>
                  <a
                    href="#author"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    About the Author
                  </a>
                </li>
                <li>
                  <a
                    href="#media"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Media Kit
                  </a>
                </li>
                <li>
                  <a
                    href="/bulk-orders"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Bulk Orders
                  </a>
                </li>
                <li>
                  <a
                    href="/faq"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="https://micpress.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Mic Press, LLC
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                Legal
              </h4>
              <ul className="font-inter space-y-2 text-sm">
                <li>
                  <a
                    href="/privacy"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy#cookies"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <CookieSettingsButton className="text-left" />
                </li>
                <li>
                  <a
                    href="/accessibility"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Accessibility
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div>
              <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                Connect
              </h4>

              {/* Social Media Icons */}
              <div className="mb-6 flex flex-wrap gap-3">
                <a
                  href="https://x.com/aibornbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="Follow on X (formerly Twitter)"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/aiborn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="Follow on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/aibornbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="Follow on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/@aibornbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="Subscribe on YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://tiktok.com/@aibornbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="Follow on TikTok"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>

              {/* Contact Information */}
              <ul className="font-inter space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:info@micpress.com"
                    className="flex items-center gap-2 text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>General Inquiries</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:press@micpress.com"
                    className="flex items-center gap-2 text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>Press Inquiries</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:partnerships@micpress.com"
                    className="flex items-center gap-2 text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>Partnerships</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mx-auto max-w-7xl border-t border-slate-200 pt-8 dark:border-slate-900">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              {/* Publisher Logo */}
              <div className="flex-shrink-0">
                <a
                  href="https://micpress.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Mic Press, LLC website"
                >
                  <MicPressLogo className="h-12 w-auto [--bg:black] [--fg:white] dark:[--bg:white] dark:[--fg:black]" />
                </a>
              </div>

              {/* Copyright Notice */}
              <div className="flex-1 text-center sm:text-right">
                <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                  © 2025 Mic Press, LLC. All rights reserved.
                </p>
                <p className="font-inter mt-1 text-xs text-slate-500 dark:text-slate-500">
                  Published by Mic Press, LLC (New York)
                </p>
                <p className="font-inter mt-1 text-xs text-slate-500 dark:text-slate-500">
                  By permission of the author, Mehran Granfar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
