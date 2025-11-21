/**
 * Protected Route Component
 *
 * Reusable server component wrapper for protecting page content with authentication
 * and optional authorization checks (entitlements, admin access).
 *
 * Features:
 * - Enforces authentication via requireAuth()
 * - Optional entitlement checks (excerpt, preorder, agentCharterPack)
 * - Optional admin-only access restriction
 * - Automatic redirect to sign-in with callback URL
 * - Access denied page for insufficient permissions
 * - Loading states during auth verification
 * - Type-safe with TypeScript generics
 *
 * @module components/auth/ProtectedRoute
 */

import { ReactNode, Suspense } from "react";
import { requireAuth, hasEntitlement } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

/**
 * Entitlement types that can be required for access
 */
export type RequiredEntitlement = "preorder" | "excerpt" | "agentCharterPack";

/**
 * Props for ProtectedRoute component
 */
export interface ProtectedRouteProps {
  /**
   * The content to render if user is authorized
   */
  children: ReactNode;

  /**
   * Optional entitlement required to access this route
   * If specified, user must have this entitlement in addition to being authenticated
   */
  requiredEntitlement?: RequiredEntitlement;

  /**
   * Optional flag to restrict access to admin users only
   * If true, user must be listed in ADMIN_EMAILS environment variable
   */
  requireAdmin?: boolean;

  /**
   * Custom redirect path after successful authentication
   * Defaults to current page path
   */
  redirectTo?: string;

  /**
   * Custom loading component to show during auth check
   */
  loadingComponent?: ReactNode;

  /**
   * Custom access denied component
   * If not provided, uses default Card-based error UI
   */
  accessDeniedComponent?: ReactNode;
}

/**
 * Loading Fallback Component
 * Shown while checking authentication status
 */
function LoadingState() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Verifying your access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Access Denied Component
 * Shown when user is authenticated but lacks required permissions
 */
interface AccessDeniedProps {
  reason: "entitlement" | "admin";
  requiredEntitlement?: RequiredEntitlement;
}

function AccessDenied({ reason, requiredEntitlement }: AccessDeniedProps) {
  const entitlementMessages = {
    preorder: "This content requires a pre-order purchase.",
    excerpt: "This content requires claiming your free excerpt.",
    agentCharterPack: "This content requires the Agent Charter Pack bonus.",
  };

  const title = reason === "admin" ? "Admin Access Required" : "Access Denied";
  const description =
    reason === "admin"
      ? "You do not have administrator privileges to access this page."
      : requiredEntitlement
        ? entitlementMessages[requiredEntitlement]
        : "You do not have the required permissions to access this content.";

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reason === "entitlement" && requiredEntitlement && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                {requiredEntitlement === "excerpt" && (
                  <>
                    <Link
                      href="/#excerpt"
                      className="font-medium text-brand-cyan hover:underline"
                    >
                      Claim your free excerpt
                    </Link>{" "}
                    to unlock this content.
                  </>
                )}
                {requiredEntitlement === "preorder" && (
                  <>
                    <Link
                      href="/#preorder"
                      className="font-medium text-brand-cyan hover:underline"
                    >
                      Pre-order the book
                    </Link>{" "}
                    to gain access.
                  </>
                )}
                {requiredEntitlement === "agentCharterPack" && (
                  <>
                    <Link
                      href="/bonus-pack"
                      className="font-medium text-brand-cyan hover:underline"
                    >
                      Claim your bonus pack
                    </Link>{" "}
                    by uploading proof of purchase.
                  </>
                )}
              </p>
            </div>
          )}
          {reason === "admin" && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                If you believe you should have access, please contact{" "}
                <a
                  href="mailto:support@ai-born.org"
                  className="font-medium text-brand-cyan hover:underline"
                >
                  support@ai-born.org
                </a>
              </p>
            </div>
          )}
          <div className="flex justify-center pt-2">
            <Link
              href="/"
              className="text-sm font-medium text-brand-cyan hover:underline"
            >
              Return to home page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Protected Route Component (Inner Implementation)
 *
 * This is the actual implementation that performs auth checks.
 * Separated from the Suspense wrapper for cleaner error handling.
 */
async function ProtectedRouteInner({
  children,
  requiredEntitlement,
  requireAdmin: requireAdminAccess,
  redirectTo,
  accessDeniedComponent,
}: ProtectedRouteProps) {
  // Step 1: Require authentication (redirects if not authenticated)
  const user = await requireAuth(redirectTo);

  // Step 2: Check admin access if required
  if (requireAdminAccess) {
    const isUserAdmin = await isAdmin(user);

    if (!isUserAdmin) {
      return accessDeniedComponent || <AccessDenied reason="admin" />;
    }
  }

  // Step 3: Check entitlement if required
  if (requiredEntitlement) {
    const hasRequiredEntitlement = await hasEntitlement(requiredEntitlement);

    if (!hasRequiredEntitlement) {
      return (
        accessDeniedComponent || (
          <AccessDenied
            reason="entitlement"
            requiredEntitlement={requiredEntitlement}
          />
        )
      );
    }
  }

  // Step 4: User is authorized, render children
  return <>{children}</>;
}

/**
 * Protected Route Component
 *
 * Wraps page content with authentication and optional authorization checks.
 * Shows loading state during verification, redirects if not authenticated,
 * and displays access denied message if authorized but lacking permissions.
 *
 * @example
 * ```tsx
 * // Basic authentication only
 * import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
 *
 * export default function AccountPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Your account settings...</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With entitlement requirement
 * import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
 *
 * export default function BonusPackPage() {
 *   return (
 *     <ProtectedRoute requiredEntitlement="agentCharterPack">
 *       <div>Download your Agent Charter Pack...</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Admin-only page
 * import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
 *
 * export default function AdminDashboard() {
 *   return (
 *     <ProtectedRoute requireAdmin>
 *       <div>Admin dashboard...</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom loading and access denied components
 * import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
 *
 * export default function CustomProtectedPage() {
 *   return (
 *     <ProtectedRoute
 *       requiredEntitlement="excerpt"
 *       loadingComponent={<MyCustomLoader />}
 *       accessDeniedComponent={<MyCustomAccessDenied />}
 *     >
 *       <div>Protected content...</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
  children,
  requiredEntitlement,
  requireAdmin: requireAdminAccess,
  redirectTo,
  loadingComponent,
  accessDeniedComponent,
}: ProtectedRouteProps) {
  return (
    <Suspense fallback={loadingComponent || <LoadingState />}>
      <ProtectedRouteInner
        requiredEntitlement={requiredEntitlement}
        requireAdmin={requireAdminAccess}
        redirectTo={redirectTo}
        accessDeniedComponent={accessDeniedComponent}
      >
        {children}
      </ProtectedRouteInner>
    </Suspense>
  );
}

/**
 * Type alias for convenience
 */
export default ProtectedRoute;
