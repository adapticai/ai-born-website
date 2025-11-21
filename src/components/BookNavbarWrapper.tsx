/**
 * Book Navbar Wrapper (Server Component)
 *
 * Server-side wrapper for BookNavbar that fetches authentication state
 * and passes user data to the client component
 *
 * @module components/BookNavbarWrapper
 */

import { getCurrentUser } from "@/lib/auth";
import { BookNavbar } from "@/components/BookNavbar";
import type { UserWithEntitlements } from "@/types/auth";

/**
 * Server Component Wrapper for BookNavbar
 *
 * Fetches current user session and passes to client navbar component
 * This allows us to show authenticated UI while keeping the navbar
 * client-side for interactivity (mobile menu, etc.)
 *
 * @example
 * ```tsx
 * // In your layout or page
 * import { BookNavbarWrapper } from '@/components/BookNavbarWrapper';
 *
 * export default function Layout() {
 *   return (
 *     <>
 *       <BookNavbarWrapper />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 */
export async function BookNavbarWrapper() {
  // Fetch user on server-side (cached per request)
  const user = await getCurrentUser();

  // Cast to UserWithEntitlements if user exists
  // Note: emailVerified, createdAt, updatedAt would need to be fetched from DB in production
  const userWithEntitlements: UserWithEntitlements | null = user
    ? {
        id: user.id || "",
        email: user.email || "",
        name: user.name,
        image: user.image,
        emailVerified: undefined,
        hasPreordered: user.hasPreordered || false,
        hasExcerpt: user.hasExcerpt || false,
        hasAgentCharterPack: user.hasAgentCharterPack || false,
        createdAt: undefined,
        updatedAt: undefined,
      }
    : null;

  return <BookNavbar user={userWithEntitlements} />;
}
