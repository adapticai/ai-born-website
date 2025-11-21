/**
 * Session Provider Component
 *
 * Wraps the application with NextAuth SessionProvider
 * Required for useSession hook to work in client components
 *
 * @module components/auth/SessionProvider
 */

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Session Provider
 * Wraps the app to provide authentication context
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { SessionProvider } from '@/components/auth/SessionProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <SessionProvider>
 *           {children}
 *         </SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
