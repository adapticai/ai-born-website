/**
 * NextAuth Type Augmentation
 *
 * Extends the default NextAuth types to include custom user properties
 * specific to the AI-Born landing page application.
 *
 * This file uses TypeScript's module augmentation to add custom fields
 * to the User and Session interfaces without modifying the original
 * NextAuth type definitions.
 */

import { DefaultSession, DefaultUser } from "next-auth";

/**
 * Module augmentation for next-auth
 * Extends the core types used throughout the authentication system
 */
declare module "next-auth" {
  /**
   * Extended User interface
   *
   * Adds custom fields to track user engagement with book-related features:
   * - Pre-order status
   * - Excerpt access
   * - Bonus pack eligibility
   * - Account creation timestamp
   */
  interface User extends DefaultUser {
    /** Indicates if the user has pre-ordered the book */
    hasPreordered?: boolean;

    /** Indicates if the user has accessed the free excerpt */
    hasExcerpt?: boolean;

    /** Indicates if the user has claimed the Agent Charter Pack bonus */
    hasAgentCharterPack?: boolean;

    /** Timestamp when the user account was created */
    createdAt?: Date;
  }

  /**
   * Extended Session interface
   *
   * Ensures the session object includes the extended User type
   * with all custom fields available throughout the application.
   */
  interface Session extends DefaultSession {
    user: {
      /** User's unique identifier */
      id: string;

      /** User's email address */
      email: string;

      /** User's display name (optional) */
      name?: string | null;

      /** User's profile image URL (optional) */
      image?: string | null;

      /** Pre-order status flag */
      hasPreordered?: boolean;

      /** Excerpt access flag */
      hasExcerpt?: boolean;

      /** Agent Charter Pack claim status */
      hasAgentCharterPack?: boolean;

      /** Account creation timestamp */
      createdAt?: Date;
    };
  }
}

/**
 * JWT type augmentation
 *
 * Extends the JWT token to include custom user fields
 * for persistence across session refreshes.
 */
declare module "next-auth/jwt" {
  interface JWT {
    /** User's unique identifier */
    id?: string;

    /** Pre-order status */
    hasPreordered?: boolean;

    /** Excerpt access status */
    hasExcerpt?: boolean;

    /** Agent Charter Pack status */
    hasAgentCharterPack?: boolean;

    /** Account creation timestamp */
    createdAt?: Date;
  }
}
