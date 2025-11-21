/**
 * Authentication Type Definitions
 *
 * TypeScript types for Auth.js (NextAuth v5)
 * Extends default types with custom user properties
 *
 * @module types/auth
 */

import "next-auth";
import "next-auth/jwt";

/**
 * User Entitlements
 * Benefits unlocked through pre-orders or email sign-up
 */
export interface UserEntitlements {
  hasPreordered: boolean;
  hasExcerpt: boolean;
  hasAgentCharterPack: boolean;
}

/**
 * User Preferences
 * Stored in JSON field in database
 */
export interface UserPreferences {
  avatarUrl?: string;
  [key: string]: unknown;
}

/**
 * User Profile Extended Properties
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  preferences?: UserPreferences | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Complete User with Entitlements
 */
export interface UserWithEntitlements extends UserProfile, UserEntitlements {}

/**
 * Auth Session Extended
 */
export interface ExtendedSession {
  user: UserWithEntitlements;
  expires: string;
}

/**
 * Extend next-auth module types
 * This adds custom properties to the default User and Session types
 */
declare module "next-auth" {
  /**
   * Extended User type
   * Adds custom properties to the default User
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
    preferences?: UserPreferences | null;
    hasPreordered?: boolean;
    hasExcerpt?: boolean;
    hasAgentCharterPack?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

  /**
   * Extended Session type
   * Adds custom properties to the session object
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      preferences?: UserPreferences | null;
      hasPreordered?: boolean;
      hasExcerpt?: boolean;
      hasAgentCharterPack?: boolean;
    };
    expires: string;
  }
}

/**
 * Extend next-auth/jwt module types
 * Adds custom properties to JWT tokens
 */
declare module "next-auth/jwt" {
  /**
   * Extended JWT type
   * Adds custom claims to the JWT token
   */
  interface JWT {
    id?: string;
    email?: string;
    name?: string | null;
    picture?: string | null;
    hasPreordered?: boolean;
    hasExcerpt?: boolean;
    hasAgentCharterPack?: boolean;
  }
}

/**
 * OAuth Provider Type
 */
export type OAuthProvider = "google" | "github";

/**
 * Auth Provider Type
 * All available authentication methods
 */
export type AuthProvider = OAuthProvider | "email";

/**
 * Sign In Options
 */
export interface SignInOptions {
  provider?: AuthProvider;
  callbackUrl?: string;
  email?: string;
}

/**
 * Sign Out Options
 */
export interface SignOutOptions {
  callbackUrl?: string;
}

/**
 * Auth Error Types
 */
export enum AuthErrorType {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
  OAuthSignin = "OAuthSignin",
  OAuthCallback = "OAuthCallback",
  OAuthCreateAccount = "OAuthCreateAccount",
  EmailCreateAccount = "EmailCreateAccount",
  Callback = "Callback",
  OAuthAccountNotLinked = "OAuthAccountNotLinked",
  EmailSignin = "EmailSignin",
  CredentialsSignin = "CredentialsSignin",
  SessionRequired = "SessionRequired",
  Default = "Default",
}

/**
 * Auth Error
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: string;
}

/**
 * Protected Route Config
 */
export interface ProtectedRouteConfig {
  path: string;
  requireAuth: boolean;
  requiredEntitlement?: keyof UserEntitlements;
  redirectTo?: string;
}

/**
 * Auth Route Paths
 */
export const AUTH_ROUTES = {
  SIGN_IN: "/auth/signin",
  SIGN_OUT: "/auth/signout",
  ERROR: "/auth/error",
  VERIFY_REQUEST: "/auth/verify-request",
  NEW_USER: "/welcome",
  CALLBACK: "/api/auth/callback",
} as const;

/**
 * Protected Route Paths
 */
export const PROTECTED_ROUTES = {
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  ACCOUNT: "/account",
  SETTINGS: "/settings",
  BONUS_CLAIM: "/bonus-claim",
  DOWNLOADS: "/downloads",
} as const;
