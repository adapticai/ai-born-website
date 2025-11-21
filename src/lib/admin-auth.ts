/**
 * Admin Authentication Helpers
 *
 * Secure server-side admin authentication utilities:
 * - Check if a user has admin privileges
 * - Require admin access for protected operations
 * - Get list of admin users
 * - Middleware integration for admin routes
 *
 * SECURITY: All admin checks are server-side only.
 * Admin emails are stored in ADMIN_EMAILS environment variable.
 *
 * @module lib/admin-auth
 */

import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

/**
 * Get list of admin email addresses from environment
 * Supports comma-separated list in ADMIN_EMAILS env var
 *
 * @returns Array of admin email addresses (lowercase)
 *
 * @example
 * ```ts
 * // .env
 * ADMIN_EMAILS=admin@example.com,support@example.com
 *
 * // Usage
 * const admins = getAdminEmails();
 * // ['admin@example.com', 'support@example.com']
 * ```
 */
export function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";

  if (!adminEmailsEnv) {
    console.warn("[Admin Auth] No ADMIN_EMAILS configured in environment");
    return [];
  }

  return adminEmailsEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Check if a user email has admin privileges
 *
 * @param email - User email to check (case-insensitive)
 * @returns True if user is an admin
 *
 * @example
 * ```ts
 * import { isAdminEmail } from '@/lib/admin-auth';
 *
 * const hasAccess = isAdminEmail('admin@example.com');
 * ```
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const adminEmails = getAdminEmails();
  const normalizedEmail = email.toLowerCase().trim();

  return adminEmails.includes(normalizedEmail);
}

/**
 * Check if the current authenticated user is an admin
 *
 * @param user - Optional user object (if not provided, fetches current session)
 * @returns True if user is an admin
 *
 * @example
 * ```tsx
 * import { isAdmin, getCurrentUser } from '@/lib/admin-auth';
 *
 * export default async function Dashboard() {
 *   const user = await getCurrentUser();
 *   const admin = await isAdmin(user);
 *
 *   if (!admin) {
 *     return <div>Access denied</div>;
 *   }
 *
 *   return <AdminPanel />;
 * }
 * ```
 */
export async function isAdmin(
  user?: { email?: string | null } | null
): Promise<boolean> {
  try {
    // If no user provided, get current session
    if (!user) {
      const session = await auth();
      user = session?.user;
    }

    if (!user?.email) {
      return false;
    }

    return isAdminEmail(user.email);
  } catch (error) {
    console.error("[Admin Auth] Error checking admin status:", error);
    return false;
  }
}

/**
 * Require admin access for a route
 * Redirects to unauthorized page if not admin
 *
 * @param redirectUrl - Optional custom redirect URL for unauthorized users
 * @returns The authenticated admin user
 * @throws Redirects to /unauthorized if not admin
 *
 * @example
 * ```tsx
 * import { requireAdmin } from '@/lib/admin-auth';
 *
 * export default async function AdminPage() {
 *   const user = await requireAdmin();
 *
 *   // User is guaranteed to be an admin here
 *   return <div>Welcome, {user.email}!</div>;
 * }
 * ```
 */
export async function requireAdmin(redirectUrl?: string) {
  const session = await auth();
  const user = session?.user;

  // Check if user is authenticated
  if (!user || !user.email) {
    const callbackUrl = redirectUrl || "/";
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // Check if user is admin
  if (!isAdminEmail(user.email)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Get list of admin users
 * Returns emails of all configured admin users
 *
 * @returns Array of admin email addresses
 *
 * @example
 * ```tsx
 * import { getAdminUsers } from '@/lib/admin-auth';
 *
 * export default async function AdminListPage() {
 *   await requireAdmin(); // Ensure current user is admin
 *
 *   const admins = getAdminUsers();
 *
 *   return (
 *     <ul>
 *       {admins.map(email => <li key={email}>{email}</li>)}
 *     </ul>
 *   );
 * }
 * ```
 */
export function getAdminUsers(): string[] {
  return getAdminEmails();
}

/**
 * Rate limiting for admin endpoints
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check rate limit for an identifier
 * Returns true if rate limit exceeded
 */
export function isRateLimited(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * Cleanup expired rate limit entries (run periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Audit logging
 */
export interface AuditLogEntry {
  timestamp: Date;
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log admin action
 * In production, send to logging service (Datadog, Sentry, etc.)
 */
export function logAdminAction(entry: AuditLogEntry): void {
  // In production, send to logging service
  console.log('[ADMIN_AUDIT]', JSON.stringify(entry));

  // Optionally, store in database for compliance
  // await prisma.auditLog.create({ data: entry });
}

/**
 * Extract client IP from request
 */
export function getClientIp(request: NextRequest): string | undefined {
  // Check various headers (depending on your hosting provider)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp;
  }

  return undefined;
}

/**
 * Middleware helper for admin routes
 */
export interface AdminAuthResult {
  authorized: boolean;
  adminId?: string;
  error?: string;
  rateLimited?: boolean;
}

/**
 * Check admin authentication from request (for API routes)
 * Validates both session authentication and admin privileges
 *
 * Note: This is for API routes. Use requireAdmin() for page routes.
 *
 * @param request - NextRequest object
 * @returns Authorization result with status
 */
export async function checkAdminAuth(
  request: NextRequest
): Promise<AdminAuthResult> {
  try {
    // Get session from auth
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return {
        authorized: false,
        error: "Unauthorized: No valid session",
      };
    }

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      return {
        authorized: false,
        error: "Forbidden: Admin access required",
      };
    }

    const adminId = session.user.email;

    // Check rate limit
    if (isRateLimited(adminId)) {
      return {
        authorized: false,
        adminId,
        error: "Rate limit exceeded",
        rateLimited: true,
      };
    }

    return {
      authorized: true,
      adminId,
    };
  } catch (error) {
    console.error("[Admin Auth] Error in checkAdminAuth:", error);
    return {
      authorized: false,
      error: "Internal server error",
    };
  }
}

/**
 * Type guard for admin user
 * Useful for TypeScript type narrowing
 *
 * @example
 * ```tsx
 * import { isAdminUser } from '@/lib/admin-auth';
 *
 * if (isAdminUser(user)) {
 *   // TypeScript knows user.email is string here
 *   console.log(`Admin: ${user.email}`);
 * }
 * ```
 */
export function isAdminUser(
  user: unknown
): user is { email: string; name?: string | null; id?: string } {
  return (
    typeof user === "object" &&
    user !== null &&
    "email" in user &&
    typeof (user as { email: unknown }).email === "string" &&
    isAdminEmail((user as { email: string }).email)
  );
}
