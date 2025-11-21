/**
 * Welcome Page - New User Onboarding
 *
 * Beautiful welcome screen for new authenticated users
 * Highlights key features and guides next actions
 *
 * @module app/welcome
 */

import { Metadata } from "next";
import { requireAuth, formatUserDisplayName, getUserEntitlements } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookFooter } from "@/components/sections/BookFooter";
import { WelcomeContent } from "./welcome-content";

export const metadata: Metadata = {
  title: "Welcome to AI-Born | Your Journey Begins",
  description: "Welcome to AI-Born. Explore the blueprint for AI-native organisations and access your exclusive content.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Welcome Page Component
 */
export default async function WelcomePage() {
  // Require authentication
  const user = await requireAuth("/welcome");

  // Get user's full data including creation date
  const userData = await prisma.user.findUnique({
    where: { id: user.id || "" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  // Get user entitlements
  const entitlements = await getUserEntitlements(user.id || "");

  // Format display name
  const displayName = formatUserDisplayName(user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-brand-obsidian">
      <BookNavbarWrapper />

      <WelcomeContent
        userName={displayName}
        userEmail={user.email || ""}
        createdAt={userData?.createdAt || new Date()}
        entitlements={entitlements}
      />

      <BookFooter />
    </div>
  );
}
