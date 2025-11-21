/**
 * Auth Error Page
 *
 * Displays authentication errors with helpful messages
 *
 * @module app/auth/error
 */

import Link from "next/link";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.authError;

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-obsidian px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <ErrorIcon />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-porcelain">
            Authentication Error
          </h1>
          <p className="mt-2 text-sm text-brand-porcelain/70">
            Something went wrong during sign-in
          </p>
        </div>

        {/* Error Card */}
        <div className="rounded-2xl bg-brand-obsidian/50 p-8 shadow-xl ring-1 ring-white/10">
          <Suspense fallback={<LoadingState />}>
            <ErrorContent />
          </Suspense>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-brand-porcelain/60">
          <Link
            href="/auth/signin"
            className="font-medium text-brand-cyan hover:text-brand-cyan/80"
          >
            Try signing in again
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
 * Error Content Component
 * Displays error-specific messages
 */
function ErrorContent() {
  // In a real implementation, you'd get the error from searchParams
  // const searchParams = useSearchParams();
  // const error = searchParams.get('error');

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-red-500/10 p-4 ring-1 ring-red-500/20">
        <p className="text-sm font-medium text-red-400">
          Unable to sign in
        </p>
        <p className="mt-1 text-sm text-brand-porcelain/70">
          Please try again or use a different sign-in method.
        </p>
      </div>

      <div className="space-y-2 text-sm text-brand-porcelain/70">
        <p className="font-medium text-brand-porcelain">
          Common issues:
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>Email link expired (valid for 24 hours)</li>
          <li>Account email address not verified</li>
          <li>OAuth provider authentication failed</li>
          <li>Network connectivity issues</li>
        </ul>
      </div>

      <div className="rounded-lg bg-brand-cyan/5 p-4 ring-1 ring-brand-cyan/20">
        <p className="text-sm text-brand-porcelain/80">
          Need help?{" "}
          <Link
            href="mailto:hello@ai-born.org"
            className="font-medium text-brand-cyan hover:text-brand-cyan/80"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Loading State
 */
function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="h-16 w-full animate-pulse rounded-lg bg-white/5" />
      <div className="h-24 w-full animate-pulse rounded-lg bg-white/5" />
    </div>
  );
}

/**
 * Error Icon
 */
function ErrorIcon() {
  return (
    <svg
      className="h-8 w-8 text-red-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}
