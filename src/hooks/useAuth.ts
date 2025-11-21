/**
 * Client-Side Authentication Hook
 *
 * Provides a clean interface for authentication in client components
 * Wraps next-auth's useSession with additional helper functions
 *
 * @module hooks/useAuth
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
 *
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <SignInButton onClick={() => signIn()} />;
 *
 * return <div>Welcome, {user.name}!</div>;
 * ```
 */

"use client";

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import { useCallback, useMemo } from "react";
import type { AuthProvider, SignInOptions, SignOutOptions } from "@/types/auth";
import { AUTH_ROUTES } from "@/types/auth";

/**
 * Auth Hook Return Type
 */
export interface UseAuthReturn {
  /** Current authenticated user or null */
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    hasPreordered?: boolean;
    hasExcerpt?: boolean;
    hasAgentCharterPack?: boolean;
  } | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether session is loading */
  isLoading: boolean;
  /** Whether user has pre-ordered the book */
  hasPreordered: boolean;
  /** Whether user has claimed the excerpt */
  hasExcerpt: boolean;
  /** Whether user has claimed the Agent Charter Pack bonus */
  hasAgentCharterPack: boolean;
  /** Sign in function */
  signIn: (options?: SignInOptions) => Promise<void>;
  /** Sign out function */
  signOut: (options?: SignOutOptions) => Promise<void>;
  /** Refresh session data */
  refresh: () => Promise<void>;
}

/**
 * Client-Side Authentication Hook
 *
 * @returns {UseAuthReturn} Authentication state and helper functions
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { user, isAuthenticated, signIn, signOut } = useAuth();
 *
 * // Sign in with email
 * await signIn({ provider: 'email', email: 'user@example.com' });
 *
 * // Sign in with OAuth provider
 * await signIn({ provider: 'google', callbackUrl: '/dashboard' });
 *
 * // Sign out
 * await signOut({ callbackUrl: '/' });
 *
 * // Check entitlements
 * if (hasPreordered) {
 *   // Show bonus claim flow
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();

  /**
   * Derived authentication state
   */
  const isLoading = useMemo(() => status === "loading", [status]);
  const isAuthenticated = useMemo(() => status === "authenticated" && !!session?.user, [status, session]);
  const user = useMemo(() => session?.user ?? null, [session]);

  /**
   * Entitlement flags
   */
  const hasPreordered = useMemo(() => user?.hasPreordered ?? false, [user]);
  const hasExcerpt = useMemo(() => user?.hasExcerpt ?? false, [user]);
  const hasAgentCharterPack = useMemo(() => user?.hasAgentCharterPack ?? false, [user]);

  /**
   * Sign In Handler
   *
   * @param {SignInOptions} options - Sign in configuration
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * // Email magic link
   * await signIn({
   *   provider: 'email',
   *   email: 'user@example.com',
   *   callbackUrl: '/dashboard'
   * });
   *
   * // OAuth provider
   * await signIn({
   *   provider: 'google',
   *   callbackUrl: '/dashboard'
   * });
   * ```
   */
  const signIn = useCallback(async (options?: SignInOptions) => {
    const { provider = "email", callbackUrl, email } = options ?? {};

    try {
      if (provider === "email" && email) {
        // Email magic link sign in
        await nextAuthSignIn("email", {
          email,
          callbackUrl: callbackUrl ?? AUTH_ROUTES.NEW_USER,
          redirect: false,
        });
      } else if (provider === "google" || provider === "github") {
        // OAuth sign in
        await nextAuthSignIn(provider, {
          callbackUrl: callbackUrl ?? AUTH_ROUTES.NEW_USER,
          redirect: true,
        });
      } else {
        // Default to sign in page
        await nextAuthSignIn(undefined, {
          callbackUrl: callbackUrl ?? AUTH_ROUTES.NEW_USER,
          redirect: true,
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }, []);

  /**
   * Sign Out Handler
   *
   * @param {SignOutOptions} options - Sign out configuration
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * // Sign out and redirect to home
   * await signOut({ callbackUrl: '/' });
   *
   * // Sign out and redirect to custom page
   * await signOut({ callbackUrl: '/goodbye' });
   * ```
   */
  const signOut = useCallback(async (options?: SignOutOptions) => {
    const { callbackUrl = "/" } = options ?? {};

    try {
      await nextAuthSignOut({
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, []);

  /**
   * Refresh Session
   *
   * Force refresh the session data from the server
   * Useful after updating user profile or entitlements
   *
   * @returns {Promise<void>}
   *
   * @example
   * ```tsx
   * // After claiming bonus
   * await claimBonus();
   * await refresh(); // Update session with new entitlement
   * ```
   */
  const refresh = useCallback(async () => {
    try {
      await update();
    } catch (error) {
      console.error("Session refresh error:", error);
      throw error;
    }
  }, [update]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasPreordered,
    hasExcerpt,
    hasAgentCharterPack,
    signIn,
    signOut,
    refresh,
  };
}

/**
 * Entitlement Check Helpers
 *
 * Convenience functions for checking specific entitlements
 */
export const useEntitlements = () => {
  const { hasPreordered, hasExcerpt, hasAgentCharterPack } = useAuth();

  return {
    hasPreordered,
    hasExcerpt,
    hasAgentCharterPack,
    hasAnyEntitlement: hasPreordered || hasExcerpt || hasAgentCharterPack,
    hasAllEntitlements: hasPreordered && hasExcerpt && hasAgentCharterPack,
  };
};

/**
 * Auth Status Check Helpers
 *
 * Convenience functions for checking auth status
 */
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    isUnauthenticated: !isAuthenticated && !isLoading,
    isReady: !isLoading,
  };
};
