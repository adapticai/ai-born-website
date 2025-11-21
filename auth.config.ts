/**
 * Auth.js (NextAuth v5) Configuration
 *
 * Comprehensive authentication setup with:
 * - OAuth providers (Google, GitHub)
 * - Email magic link provider
 * - Prisma adapter for database sessions
 * - JWT + Database session strategy
 * - Custom callbacks for session/JWT handling
 * - Type-safe configuration
 * - Analytics event tracking for auth flows
 */

import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { ReceiptStatus, BonusClaimStatus, EntitlementType, EntitlementStatus } from "@prisma/client";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import {
  trackSignIn,
  trackSignUp,
  trackSignOut,
  trackAuthError,
  trackAuthenticatedUserSegment,
  trackProviderUsage,
} from "@/lib/auth-analytics";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Get user entitlements from database
 * Returns all benefits the user has access to
 *
 * NOTE: This function is duplicated here to avoid circular dependency
 * since auth.config.ts is imported by auth.ts which is imported by lib/auth.ts
 *
 * @param userId - The user ID to check
 * @returns Object with all entitlement flags
 */
async function getUserEntitlements(userId: string): Promise<{
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
    logger.error({ err: error, userId }, "Error fetching user entitlements in auth callback");

    // Return safe defaults on error
    return {
      hasPreordered: false,
      hasExcerpt: false,
      hasAgentCharterPack: false,
    };
  }
}

/**
 * NextAuth configuration object
 * This is imported by both the API route and middleware
 */
export const authConfig = {
  /**
   * Session Strategy
   * Using JWT for performance, with database persistence
   */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  /**
   * Authentication Pages
   * Custom routes for sign-in, error, etc.
   */
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/welcome", // Redirect new users here
  },

  /**
   * Authentication Providers
   */
  providers: [
    /**
     * Google OAuth Provider
     * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
     */
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    }),

    /**
     * GitHub OAuth Provider
     * Requires GITHUB_ID and GITHUB_SECRET
     */
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: false,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || "",
          image: profile.avatar_url,
          emailVerified: null,
        };
      },
    }),

    /**
     * Email Magic Link Provider (via Resend)
     * Requires RESEND_API_KEY
     */
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "AI-Born <auth@ai-born.org>",
      // Custom email template
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          const { host } = new URL(url);
          const result = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${provider.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: provider.from,
              to: email,
              subject: `Sign in to AI-Born`,
              html: getEmailTemplate(url, host),
              text: getEmailTemplateText(url, host),
            }),
          });

          if (!result.ok) {
            const error = await result.text();
            throw new Error(`Resend error: ${error}`);
          }
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw error;
        }
      },
    }),
  ],

  /**
   * Callbacks
   * Customize session, JWT, and sign-in behavior
   */
  callbacks: {
    /**
     * Sign In Callback
     * Control who can sign in and ensure user record exists in database
     *
     * @param params - Sign in callback parameters
     * @returns True to allow sign-in, false to deny
     */
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // For OAuth providers, ensure user record exists in database
        if (account?.provider && user?.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // Create user record if it doesn't exist (OAuth sign-up)
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                emailVerified: user.emailVerified || null,
                createdAt: new Date(),
              },
            });

            logger.info(
              {
                email: user.email,
                provider: account.provider,
                userId: user.id,
              },
              "New user created via OAuth sign-in"
            );
          }
        }

        // Log successful sign-in attempt
        logger.info(
          {
            userId: user?.id,
            email: user?.email,
            provider: account?.provider || "credentials",
          },
          "User sign-in successful"
        );

        // Allow all sign-ins by default
        // Add custom logic here (e.g., domain restrictions, allowlists)
        return true;
      } catch (error) {
        logger.error(
          {
            err: error,
            email: user?.email,
            provider: account?.provider,
          },
          "Error during sign-in callback"
        );

        // Track auth error
        trackAuthError(
          account?.provider as 'google' | 'github' | 'email' | 'credentials' || 'credentials',
          error instanceof Error ? error.message : 'Unknown error'
        );

        // Allow sign-in even if database operations fail
        // This prevents users from being locked out due to transient DB issues
        return true;
      }
    },

    /**
     * JWT Callback
     * Add custom data to the JWT token including user entitlements
     *
     * @param params - JWT callback parameters
     * @returns Updated JWT token with custom fields
     */
    async jwt({ token, user, account, profile, trigger, session }) {
      try {
        // Initial sign in - populate token with user data
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;

          // Fetch user from database to get createdAt
          if (user.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: { createdAt: true },
            });

            if (dbUser) {
              token.createdAt = dbUser.createdAt;
            }
          }

          // Fetch and include entitlements in JWT
          if (user.id) {
            const entitlements = await getUserEntitlements(user.id);
            token.hasPreordered = entitlements.hasPreordered;
            token.hasExcerpt = entitlements.hasExcerpt;
            token.hasAgentCharterPack = entitlements.hasAgentCharterPack;

            logger.debug(
              {
                userId: user.id,
                entitlements,
              },
              "JWT token populated with user entitlements"
            );
          }
        }

        // Handle manual session updates (e.g., after claiming bonus)
        if (trigger === "update" && session) {
          // Allow updating specific fields while preserving others
          if ('hasPreordered' in session) {
            token.hasPreordered = session.hasPreordered;
          }
          if ('hasExcerpt' in session) {
            token.hasExcerpt = session.hasExcerpt;
          }
          if ('hasAgentCharterPack' in session) {
            token.hasAgentCharterPack = session.hasAgentCharterPack;
          }

          logger.debug(
            {
              userId: token.id,
              trigger,
            },
            "JWT token updated via session update"
          );
        }

        return token;
      } catch (error) {
        logger.error(
          {
            err: error,
            userId: user?.id || token?.id,
            trigger,
          },
          "Error in JWT callback"
        );

        // Return token as-is on error to prevent breaking auth flow
        return token;
      }
    },

    /**
     * Session Callback
     * Map JWT token data to session object for client-side access
     *
     * @param params - Session callback parameters
     * @returns Session with custom user fields
     */
    async session({ session, token, user }: { session: Session; token: JWT; user?: any }) {
      try {
        // Map JWT token data to session user object
        if (token && session.user) {
          // Type assertion for extended session user properties
          const user = session.user as {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            hasPreordered?: boolean;
            hasExcerpt?: boolean;
            hasAgentCharterPack?: boolean;
            createdAt?: Date;
          };

          user.id = token.id as string;
          user.email = token.email as string;
          user.name = token.name as string;
          user.image = token.picture as string;

          // Include custom entitlement fields
          user.hasPreordered = token.hasPreordered || false;
          user.hasExcerpt = token.hasExcerpt || false;
          user.hasAgentCharterPack = token.hasAgentCharterPack || false;

          // Include account creation timestamp
          user.createdAt = token.createdAt as Date | undefined;

          logger.debug(
            {
              userId: user.id,
              hasPreordered: user.hasPreordered,
              hasExcerpt: user.hasExcerpt,
              hasAgentCharterPack: user.hasAgentCharterPack,
            },
            "Session populated with user entitlements"
          );
        }

        return session;
      } catch (error) {
        logger.error(
          {
            err: error,
            userId: token?.id,
          },
          "Error in session callback"
        );

        // Return session as-is on error
        return session;
      }
    },

    /**
     * Redirect Callback
     * Control where users are redirected after sign-in/sign-out
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  /**
   * Events
   * Log authentication events and track analytics
   */
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} (new: ${isNewUser})`);

      // Track sign-in event
      if (account?.provider) {
        const provider = account.provider as 'google' | 'github' | 'email' | 'credentials';
        trackSignIn(provider, true, undefined, isNewUser);

        // Track user segment
        if (isNewUser !== undefined) {
          trackAuthenticatedUserSegment(isNewUser);
        }

        // Track provider usage
        trackProviderUsage(provider);
      }
    },
    async signOut(params) {
      console.log(`User signed out`);

      // Track sign-out event
      const userId = "token" in params ? params.token?.sub : undefined;
      trackSignOut(userId);
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);

      // Track sign-up event
      // Note: Provider info not directly available in this event,
      // tracked in signIn event with isNewUser flag
      if (user.email) {
        trackSignUp('email', true);
      }
    },
    async linkAccount({ user, account, profile }) {
      console.log(`Account linked: ${user.email} via ${account.provider}`);

      // Track as successful sign-in with linked account
      if (account.provider) {
        const provider = account.provider as 'google' | 'github' | 'email' | 'credentials';
        trackSignIn(provider, true, undefined, false);
      }
    },
  },

  /**
   * Advanced Options
   */
  debug: process.env.NODE_ENV === "development",
  trustHost: true, // Required for deployment on Vercel/similar platforms

  /**
   * Security
   */
  useSecureCookies: process.env.NODE_ENV === "production",

} satisfies NextAuthConfig;

/**
 * Email Template (HTML)
 * Professional magic link email
 */
function getEmailTemplate(url: string, host: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to AI-Born</title>
</head>
<body style="margin: 0; padding: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #fafafa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #1a1a1f; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 32px; text-align: center; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2f 100%);">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #fafafa;">AI-Born</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #a0a0a0;">The Machine Core, the Human Cortex</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 48px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #fafafa;">Sign in to your account</h2>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #d0d0d0;">
                Click the button below to securely sign in to your AI-Born account. This link will expire in 24 hours.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #00d9ff 0%, #0088cc 100%);">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #0a0a0f; text-decoration: none;">
                      Sign in to AI-Born
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #a0a0a0;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 48px; background-color: #0a0a0f; border-top: 1px solid #2a2a2f;">
              <p style="margin: 0; font-size: 12px; color: #808080; text-align: center;">
                © ${new Date().getFullYear()} AI-Born. All rights reserved.<br/>
                <a href="https://${host}/privacy" style="color: #00d9ff; text-decoration: none;">Privacy Policy</a> •
                <a href="https://${host}/terms" style="color: #00d9ff; text-decoration: none;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Email Template (Plain Text)
 * Fallback for email clients that don't support HTML
 */
function getEmailTemplateText(url: string, host: string): string {
  return `
Sign in to AI-Born

Click the link below to securely sign in to your account:

${url}

This link will expire in 24 hours.

If you didn't request this email, you can safely ignore it.

---
© ${new Date().getFullYear()} AI-Born. All rights reserved.
${host}
`;
}
