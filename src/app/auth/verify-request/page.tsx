/**
 * Verify Request Page
 *
 * Shown after email magic link is sent
 *
 * @module app/auth/verify-request
 */

import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.authVerifyRequest;

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-obsidian px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan/10">
            <EmailSentIcon />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-porcelain">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-brand-porcelain/70">
            A sign-in link has been sent to your email address
          </p>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl bg-brand-obsidian/50 p-8 shadow-xl ring-1 ring-white/10">
          <div className="space-y-4 text-sm text-brand-porcelain/80">
            <p>
              Click the link in the email to sign in to your account. The link
              will expire in 24 hours.
            </p>

            <div className="rounded-lg bg-brand-cyan/5 p-4 ring-1 ring-brand-cyan/20">
              <p className="text-brand-cyan">
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-brand-porcelain/70">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes for the email to arrive</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-brand-porcelain/60">
          <Link
            href="/auth/signin"
            className="font-medium text-brand-cyan hover:text-brand-cyan/80"
          >
            Back to sign in
          </Link>
          {" · "}
          <Link
            href="/"
            className="hover:text-brand-cyan"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Email Sent Icon
 */
function EmailSentIcon() {
  return (
    <svg
      className="h-8 w-8 text-brand-cyan"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
      />
    </svg>
  );
}
