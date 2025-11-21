/**
 * Account Page
 * Protected route showing user profile, entitlements, and downloads
 */

import { Suspense } from "react";

import { AccountContent } from "./AccountContent";

import { AuthLoadingState } from "@/components/auth";
import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookFooter } from "@/components/sections/BookFooter";
import { requireAuth, formatUserDisplayName } from "@/lib/auth";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | AI-Born",
  description: "Manage your AI-Born account, downloads, and pre-order status",
};

export default async function AccountPage() {
  // Protect route - redirects to sign-in if not authenticated
  const user = await requireAuth("/account");

  return (
    <>
      <BookNavbarWrapper />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 dark:from-gray-950 dark:to-black">
        <div className="container max-w-6xl py-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 lg:text-4xl">
              Account
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Welcome back, {formatUserDisplayName(user)}
            </p>
          </div>

          {/* Account Content - Client Component */}
          <Suspense
            fallback={
              <AuthLoadingState
                variant="page"
                message="Loading your account..."
                showSpinner
              />
            }
          >
            <AccountContent />
          </Suspense>
        </div>
      </main>
      <BookFooter />
    </>
  );
}
