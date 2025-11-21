import { getCurrentUser, getUserEntitlements } from "@/lib/auth";
import { BookHeroClient } from "./BookHeroClient";

export async function BookHero() {
  // Check authentication status
  const user = await getCurrentUser();

  // Get user entitlements if authenticated
  let entitlements = null;
  if (user?.id) {
    entitlements = await getUserEntitlements(user.id);
  }

  const isAuthenticated = !!user;
  const hasContent =
    entitlements &&
    (entitlements.hasExcerpt ||
      entitlements.hasAgentCharterPack ||
      entitlements.hasPreordered);

  return (
    <BookHeroClient
      isAuthenticated={isAuthenticated}
      hasContent={!!hasContent}
    />
  );
}
