/**
 * Navbar Wrapper (Server Component)
 *
 * Server-side wrapper for Navbar that fetches authentication state
 * and passes user data to the client component
 *
 * Features:
 * - Async server component for server-side auth checks
 * - Uses React cache for optimal performance
 * - Type-safe user data handling
 * - Handles missing/incomplete user data gracefully
 *
 * @module components/blocks/navbar-wrapper
 */

import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "./navbar";

/**
 * Cached version of getCurrentUser for navbar
 * Ensures user data is fetched only once per request
 */
const getCachedUser = cache(async () => {
  return await getCurrentUser();
});

/**
 * User interface matching Navbar expectations
 */
interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

/**
 * Server Component Wrapper for Navbar
 *
 * Fetches current user session server-side and passes to client navbar component.
 * This allows the navbar to show authenticated UI while remaining client-side
 * for interactivity (mobile menu, dropdowns, etc.)
 *
 * The component uses React cache to optimize performance and prevent
 * duplicate auth calls within the same request.
 *
 * @example
 * ```tsx
 * // In your layout or page
 * import { NavbarWrapper } from '@/components/blocks/navbar-wrapper';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       <NavbarWrapper />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In a page with specific layout
 * import { NavbarWrapper } from '@/components/blocks/navbar-wrapper';
 *
 * export default function ContactPage() {
 *   return (
 *     <div>
 *       <NavbarWrapper />
 *       <main>{/* page content *\/}</main>
 *     </div>
 *   );
 * }
 * ```
 */
export async function NavbarWrapper() {
  // Fetch user on server-side (cached per request)
  const sessionUser = await getCachedUser();

  // Transform to User interface expected by Navbar
  // Handle cases where user might be null or have missing fields
  const user: User | null = sessionUser
    ? {
        id: sessionUser.id || "",
        email: sessionUser.email || null,
        name: sessionUser.name || null,
        image: sessionUser.image || null,
      }
    : null;

  return <Navbar user={user} />;
}
