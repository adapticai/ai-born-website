"use client";

import { Linkedin, Instagram, Youtube } from "lucide-react";

import { EmailCaptureForm } from "@/components/forms/EmailCaptureForm";
import { MicPressLogo } from "@/components/icons/MicPressLogo";
import { RetailerMenu } from "@/components/RetailerMenu";

export function BookFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-900 dark:bg-black">
      {/* Newsletter Section */}
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

      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 grid max-w-7xl gap-12 md:grid-cols-5">
            {/* Column 1: Book Info */}
            <div>
              <h4 className="font-outfit -mt-2 mb-0 text-2xl font-extrabold tracking-tight text-black uppercase dark:text-white">
                AI-Born
              </h4>
              <p className="font-inter mb-6 font-serif text-base leading-relaxed text-slate-500 dark:text-slate-500">
                By Mehran Granfar
              </p>
              <a
                href="https://micpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-8 block text-black transition-colors hover:text-slate-600 dark:text-white dark:hover:text-slate-400"
                aria-label="Visit Mic Press website"
              >
                <MicPressLogo className="h-6 w-auto" />
              </a>
              <RetailerMenu
                triggerText="Pre-order Now"
                triggerVariant="primary"
                originSection="footer"
                className="font-outfit rounded-none bg-black px-4 py-2 text-xs font-semibold tracking-tight text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
              />
            </div>

            {/* Column 2: For Readers */}
            <div>
              <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                For Readers
              </h4>
              <ul className="font-inter space-y-3 text-sm">
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
                    href="#audiences"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Who This Is For
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
                    href="/faq"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: For Organizations */}
            <div>
              <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                For Organizations
              </h4>
              <ul className="font-inter space-y-3 text-sm">
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
                    href="#media"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Speaking Engagements
                  </a>
                </li>
                <li>
                  <a
                    href="/media-kit"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Media Kit
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:partnerships@micpress.com"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Partnerships
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: About */}
            <div>
              <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                About
              </h4>
              <ul className="font-inter space-y-3 text-sm">
                <li>
                  <a
                    href="/author"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    The Author
                  </a>
                </li>
                <li>
                  <a
                    href="https://micpress.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Mic Press
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5: Connect */}
            <div>
              <h4 className="font-outfit mb-4 text-xs font-semibold tracking-wider text-black uppercase dark:text-white">
                Connect
              </h4>
              <div className="mb-6 flex gap-4">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="X (formerly Twitter)"
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
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
                  aria-label="TikTok"
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
              <div className="font-inter space-y-2 text-xs text-slate-500 dark:text-slate-500">
                <p>
                  <a
                    href="mailto:info@micpress.com"
                    className="transition-colors hover:text-black dark:hover:text-white"
                  >
                    info@micpress.com
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:press@micpress.com"
                    className="transition-colors hover:text-black dark:hover:text-white"
                  >
                    Press inquiries
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl border-t border-slate-200 pt-8 dark:border-slate-900">
            {/* Copyright */}
            <div className="text-center">
              <p className="font-inter text-sm text-slate-500 dark:text-slate-600">
                © 2025 Mic Press, LLC. All rights reserved.
                <br />
                <span className="text-xs">
                  By permission of the author, Mehran Granfar.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
