/**
 * Auth.js Helper Functions
 *
 * Utility functions for authentication and authorization:
 * - Server-side session retrieval
 * - Route protection
 * - User entitlement checks
 * - Type-safe auth helpers
 *
 * @module lib/auth
 */

import { auth as nextAuth } from "../../auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { ReceiptStatus, BonusClaimStatus, EntitlementType, EntitlementStatus } from "@prisma/client";

/**
 * Re-export auth for use in other modules
 */
export { nextAuth as auth };

/**
 * Extended User type with entitlements
 */
export interface UserWithEntitlements {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  hasPreordered?: boolean;
  hasExcerpt?: boolean;
  hasAgentCharterPack?: boolean;
}

/**
 * Get the current authenticated user
 * Cached for performance within the same request
 *
 * @returns The current user session or null if not authenticated
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { getCurrentUser } from '@/lib/auth';
 *
 * export default async function ProfilePage() {
 *   const user = await getCurrentUser();
 *
 *   if (!user) {
 *     return <div>Not authenticated</div>;
 *   }
 *
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 */
export const getCurrentUser = cache(async () => {
  try {
    const session = await nextAuth();
    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
});

/**
 * Get the full server session
 * Includes user and session metadata
 *
 * @returns The complete session object or null
 *
 * @example
 * ```tsx
 * import { getSession } from '@/lib/auth';
 *
 * export default async function DashboardPage() {
 *   const session = await getSession();
 *
 *   if (!session) {
 *     return <div>Please sign in</div>;
 *   }
 *
 *   return <div>Session expires: {session.expires}</div>;
 * }
 * ```
 */
export const getSession = cache(async () => {
  try {
    const session = await nextAuth();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
});

/**
 * Require authentication for a route
 * Redirects to sign-in page if not authenticated
 *
 * @param redirectTo - Optional path to redirect after sign-in
 * @returns The authenticated user
 * @throws Redirects to sign-in if not authenticated
 *
 * @example
 * ```tsx
 * import { requireAuth } from '@/lib/auth';
 *
 * export default async function ProtectedPage() {
 *   const user = await requireAuth();
 *
 *   // User is guaranteed to be authenticated here
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser();

  if (!user) {
    const callbackUrl = redirectTo || "/";
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return user;
}

/**
 * Check if a route requires authentication
 * Used by middleware to protect routes
 *
 * @param pathname - The route pathname to check
 * @returns True if the route requires authentication
 *
 * @example
 * ```ts
 * import { isProtectedRoute } from '@/lib/auth';
 *
 * export function middleware(request: NextRequest) {
 *   if (isProtectedRoute(request.nextUrl.pathname)) {
 *     // Check authentication
 *   }
 * }
 * ```
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/account",
    "/settings",
    "/bonus-claim",
    "/downloads",
    "/admin", // Admin routes require authentication + admin privileges
  ];

  return protectedPaths.some((path) => pathname.startsWith(path));
}

/**
 * Check if a route requires admin privileges
 *
 * @param pathname - The route pathname to check
 * @returns True if the route requires admin access
 *
 * @example
 * ```ts
 * import { isAdminRoute } from '@/lib/auth';
 *
 * export function middleware(request: NextRequest) {
 *   if (isAdminRoute(request.nextUrl.pathname)) {
 *     // Check admin access
 *   }
 * }
 * ```
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

/**
 * Check if a user has a specific entitlement
 * Queries the database for user benefits and access rights
 *
 * @param entitlement - The entitlement to check
 * @returns True if the user has the entitlement
 *
 * @example
 * ```tsx
 * import { hasEntitlement } from '@/lib/auth';
 *
 * export default async function BonusPage() {
 *   const hasPack = await hasEntitlement('agentCharterPack');
 *
 *   if (!hasPack) {
 *     return <div>Pre-order to unlock this content</div>;
 *   }
 *
 *   return <div>Download your Agent Charter Pack</div>;
 * }
 * ```
 */
export async function hasEntitlement(
  entitlement: "preorder" | "excerpt" | "agentCharterPack"
): Promise<boolean> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return false;
    }

    // Get all entitlements from database
    const entitlements = await getUserEntitlements(user.id);

    // Map entitlement parameter to the corresponding field
    const entitlementMap = {
      preorder: entitlements.hasPreordered,
      excerpt: entitlements.hasExcerpt,
      agentCharterPack: entitlements.hasAgentCharterPack,
    } as const;

    return entitlementMap[entitlement];
  } catch (error) {
    console.error(`Error checking entitlement '${entitlement}':`, error);
    // Fail closed - deny access on error
    return false;
  }
}

/**
 * Get user entitlements from database
 * Returns all benefits the user has access to
 *
 * @param userId - The user ID to check
 * @returns Object with all entitlement flags
 *
 * @example
 * ```tsx
 * import { getUserEntitlements } from '@/lib/auth';
 *
 * export default async function BenefitsPage() {
 *   const user = await requireAuth();
 *   const benefits = await getUserEntitlements(user.id);
 *
 *   return (
 *     <div>
 *       <p>Excerpt: {benefits.hasExcerpt ? 'Yes' : 'No'}</p>
 *       <p>Pre-order: {benefits.hasPreordered ? 'Yes' : 'No'}</p>
 *       <p>Charter Pack: {benefits.hasAgentCharterPack ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export async function getUserEntitlements(userId: string): Promise<{
  hasPreordered: boolean;
  hasExcerpt: boolean;
  hasAgentCharterPack: boolean;
}> {
  try {
    // Query all related data in parallel for performance
    const [verifiedReceipts, deliveredBonusClaims, excerptEntitlements] = await Promise.all([
      // Check for verified receipts (indicates pre-order)
      prisma.receipt.count({
        where: {
          userId,
          status: "VERIFIED" as ReceiptStatus,
        },
      }),

      // Check for delivered bonus packs
      prisma.bonusClaim.count({
        where: {
          userId,
          status: "DELIVERED" as BonusClaimStatus,
        },
      }),

      // Check for excerpt entitlements (EARLY_EXCERPT type, ACTIVE or FULFILLED status)
      prisma.entitlement.count({
        where: {
          userId,
          type: "EARLY_EXCERPT" as EntitlementType,
          status: {
            in: ["ACTIVE" as EntitlementStatus, "FULFILLED" as EntitlementStatus],
          },
        },
      }),
    ]);

    return {
      hasPreordered: verifiedReceipts > 0,
      hasExcerpt: excerptEntitlements > 0,
      hasAgentCharterPack: deliveredBonusClaims > 0,
    };
  } catch (error) {
    // Log error but don't expose internal details
    console.error("Error fetching user entitlements:", error);

    // Return safe defaults on error
    return {
      hasPreordered: false,
      hasExcerpt: false,
      hasAgentCharterPack: false,
    };
  }
}

/**
 * Check if user can access a specific resource
 * Combines authentication and authorization
 *
 * @param resourceType - Type of resource to check
 * @param resourceId - Optional specific resource ID
 * @returns True if user has access
 *
 * @example
 * ```tsx
 * import { canAccessResource } from '@/lib/auth';
 *
 * export default async function DownloadPage({ params }) {
 *   const canAccess = await canAccessResource('agentCharterPack');
 *
 *   if (!canAccess) {
 *     return <div>Access denied</div>;
 *   }
 *
 *   return <DownloadButton />;
 * }
 * ```
 */
export async function canAccessResource(
  resourceType: "excerpt" | "agentCharterPack" | "pressKit",
  resourceId?: string
): Promise<boolean> {
  const user = await getCurrentUser();

  // Public resources
  if (resourceType === "pressKit") {
    return true;
  }

  // Require authentication
  if (!user) {
    return false;
  }

  // Check specific entitlements
  if (resourceType === "excerpt") {
    return await hasEntitlement("excerpt");
  }

  if (resourceType === "agentCharterPack") {
    return await hasEntitlement("agentCharterPack");
  }

  return false;
}

/**
 * Verify email ownership
 * Used for bonus claim validation
 *
 * @param email - Email to verify
 * @returns True if email is verified
 *
 * @example
 * ```tsx
 * import { verifyEmailOwnership } from '@/lib/auth';
 *
 * export async function claimBonus(email: string) {
 *   const verified = await verifyEmailOwnership(email);
 *
 *   if (!verified) {
 *     throw new Error('Please verify your email first');
 *   }
 *
 *   // Process bonus claim
 * }
 * ```
 */
export async function verifyEmailOwnership(email: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user || !user.email) {
    return false;
  }

  return user.email.toLowerCase() === email.toLowerCase();
}

/**
 * Get sign-in URL with callback
 *
 * @param callbackUrl - URL to redirect after sign-in
 * @returns Sign-in URL with callback parameter
 *
 * @example
 * ```tsx
 * import { getSignInUrl } from '@/lib/auth';
 *
 * export function ProtectedButton() {
 *   const signInUrl = getSignInUrl('/bonus-claim');
 *
 *   return (
 *     <a href={signInUrl}>
 *       Sign in to claim bonus
 *     </a>
 *   );
 * }
 * ```
 */
export function getSignInUrl(callbackUrl: string = "/"): string {
  return `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

/**
 * Get sign-out URL with callback
 *
 * @param callbackUrl - URL to redirect after sign-out
 * @returns Sign-out URL with callback parameter
 *
 * @example
 * ```tsx
 * import { getSignOutUrl } from '@/lib/auth';
 *
 * export function SignOutButton() {
 *   const signOutUrl = getSignOutUrl('/');
 *
 *   return (
 *     <a href={signOutUrl}>
 *       Sign out
 *     </a>
 *   );
 * }
 * ```
 */
export function getSignOutUrl(callbackUrl: string = "/"): string {
  return `/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

/**
 * Format user display name
 * Falls back gracefully if name is not available
 *
 * @param user - User object
 * @returns Formatted display name
 *
 * @example
 * ```tsx
 * import { formatUserDisplayName } from '@/lib/auth';
 *
 * export function UserGreeting({ user }) {
 *   return <div>Hello, {formatUserDisplayName(user)}!</div>;
 * }
 * ```
 */
export function formatUserDisplayName(user: {
  name?: string | null;
  email?: string | null;
}): string {
  if (user.name) {
    return user.name;
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "User";
}

/**
 * Get user avatar URL
 * Checks uploaded avatar in preferences first, then falls back to OAuth image
 *
 * @param user - User object
 * @returns Avatar URL or undefined
 *
 * @example
 * ```tsx
 * import { getUserAvatarUrl } from '@/lib/auth';
 *
 * export function UserAvatar({ user }) {
 *   const avatarUrl = getUserAvatarUrl(user);
 *   return <img src={avatarUrl || '/default-avatar.png'} alt="Avatar" />;
 * }
 * ```
 */
export function getUserAvatarUrl(user: {
  image?: string | null;
  preferences?: Record<string, unknown> | null;
}): string | undefined {
  // First check if user has uploaded custom avatar in preferences
  if (user.preferences && typeof user.preferences === "object") {
    const prefs = user.preferences as Record<string, unknown>;
    if (prefs.avatarUrl && typeof prefs.avatarUrl === "string") {
      return prefs.avatarUrl;
    }
  }

  // Fall back to OAuth provider image
  if (user.image) {
    return user.image;
  }

  return undefined;
}
