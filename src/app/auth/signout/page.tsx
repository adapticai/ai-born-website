/**
 * Sign Out Page
 *
 * Confirms sign-out action
 *
 * @module app/auth/signout
 */

import { SignOutButton } from "@/components/auth";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.authSignOut;

export default function SignOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-obsidian px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-brand-porcelain">
            Sign Out
          </h1>
          <p className="mt-2 text-sm text-brand-porcelain/70">
            Are you sure you want to sign out?
          </p>
        </div>

        {/* Sign Out Card */}
        <div className="rounded-2xl bg-brand-obsidian/50 p-8 shadow-xl ring-1 ring-white/10">
          <div className="space-y-4">
            <SignOutButton
              variant="destructive"
              className="w-full"
              callbackUrl="/"
            >
              Yes, sign me out
            </SignOutButton>

            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-brand-porcelain transition-colors hover:bg-white/10"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
