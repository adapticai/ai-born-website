/**
 * Settings Page
 * Protected route for managing user settings and preferences
 * Uses shadcn/ui Tabs component for organized settings sections
 */

import { requireAuth, formatUserDisplayName } from "@/lib/auth";
import { SettingsContent } from "./SettingsContent";
import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookFooter } from "@/components/sections/BookFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | AI-Born",
  description: "Manage your account settings, security, preferences, and notifications",
};

export default async function SettingsPage() {
  // Protect route - redirects to sign-in if not authenticated
  const user = await requireAuth("/settings");

  return (
    <>
      <BookNavbarWrapper />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 dark:from-gray-950 dark:to-black">
        <div className="container max-w-6xl py-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 lg:text-4xl">
              Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Settings Content - Client Component with Tabs */}
          <SettingsContent user={user} />
        </div>
      </main>
      <BookFooter />
    </>
  );
}
