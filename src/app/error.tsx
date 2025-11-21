"use client";

/**
 * Global Error Boundary (Next.js App Router)
 *
 * This error boundary catches all unhandled errors in the application,
 * including authentication errors. It provides a beautiful, brand-styled
 * error UI with helpful recovery actions.
 *
 * Features:
 * - Automatic error logging to console and Sentry
 * - Beautiful error UI with brand colours
 * - Contextual error messages for different error types
 * - Recovery actions (retry, go home, contact support)
 * - Responsive design
 * - Accessibility compliant
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 * @module app/error
 */

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthErrorType } from "@/types/auth";
import { logger } from "@/lib/logger";

// ============================================================================
// Types
// ============================================================================

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ============================================================================
// Error Type Detection
// ============================================================================

/**
 * Determine if error is authentication-related
 */
function isAuthError(error: Error): boolean {
  const message = error.message.toLowerCase();
  const authKeywords = [
    "auth",
    "session",
    "signin",
    "login",
    "unauthorized",
    "forbidden",
    "access denied",
    "verification",
    "oauth",
    "credentials",
  ];

  return authKeywords.some((keyword) => message.includes(keyword));
}

/**
 * Determine the auth error type from an error object
 */
function getAuthErrorType(error: Error): AuthErrorType | null {
  if (!isAuthError(error)) return null;

  const message = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  if (message.includes("configuration") || errorName.includes("configuration")) {
    return AuthErrorType.Configuration;
  }

  if (message.includes("access denied") || message.includes("accessdenied")) {
    return AuthErrorType.AccessDenied;
  }

  if (message.includes("verification") || message.includes("verify")) {
    return AuthErrorType.Verification;
  }

  if (message.includes("session required") || message.includes("unauthorized")) {
    return AuthErrorType.SessionRequired;
  }

  if (message.includes("oauth")) {
    return AuthErrorType.OAuthSignin;
  }

  if (message.includes("email")) {
    return AuthErrorType.EmailSignin;
  }

  return AuthErrorType.Default;
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: Error): {
  title: string;
  description: string;
} {
  const authErrorType = getAuthErrorType(error);

  // Authentication-specific errors
  if (authErrorType) {
    const authMessages: Record<AuthErrorType, { title: string; description: string }> = {
      [AuthErrorType.Configuration]: {
        title: "Configuration error",
        description: "There is a problem with the authentication configuration. Our team has been notified.",
      },
      [AuthErrorType.AccessDenied]: {
        title: "Access denied",
        description: "You do not have permission to access this resource. Please sign in with an authorised account.",
      },
      [AuthErrorType.Verification]: {
        title: "Verification failed",
        description: "We could not verify your email address. Please check your inbox or request a new verification link.",
      },
      [AuthErrorType.SessionRequired]: {
        title: "Authentication required",
        description: "You must be signed in to access this page. Please sign in to continue.",
      },
      [AuthErrorType.OAuthSignin]: {
        title: "Sign-in error",
        description: "There was a problem signing in. Please try again or use a different sign-in method.",
      },
      [AuthErrorType.EmailSignin]: {
        title: "Email sign-in error",
        description: "We could not send a sign-in link to your email. Please try again.",
      },
      [AuthErrorType.OAuthCallback]: {
        title: "Authentication error",
        description: "There was a problem completing authentication. Please try signing in again.",
      },
      [AuthErrorType.OAuthCreateAccount]: {
        title: "Account creation error",
        description: "We could not create your account. Please try a different sign-in method.",
      },
      [AuthErrorType.EmailCreateAccount]: {
        title: "Account creation error",
        description: "We could not create your account. Please try again or contact support.",
      },
      [AuthErrorType.Callback]: {
        title: "Authentication error",
        description: "There was a problem completing authentication. Please try again.",
      },
      [AuthErrorType.OAuthAccountNotLinked]: {
        title: "Account not linked",
        description: "This account is already associated with a different sign-in method.",
      },
      [AuthErrorType.CredentialsSignin]: {
        title: "Invalid credentials",
        description: "The credentials you provided are incorrect. Please check your details and try again.",
      },
      [AuthErrorType.Default]: {
        title: "Authentication error",
        description: "An unexpected error occurred during authentication. Please try again.",
      },
    };

    return authMessages[authErrorType];
  }

  // Network errors
  if (error.message.includes("network") || error.message.includes("fetch")) {
    return {
      title: "Network error",
      description: "We could not connect to our servers. Please check your internet connection and try again.",
    };
  }

  // Rate limiting
  if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
    return {
      title: "Too many requests",
      description: "You have made too many requests. Please wait a moment and try again.",
    };
  }

  // Default error
  return {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again or contact support if the problem persists.",
  };
}

// ============================================================================
// Error Component
// ============================================================================

/**
 * Global Error UI Component
 *
 * This component is automatically rendered when an unhandled error occurs
 * anywhere in the application (client-side).
 *
 * @param error - The error that was thrown
 * @param reset - Function to attempt recovery by re-rendering the segment
 */
export default function Error({ error, reset }: ErrorProps) {
  const { title, description } = getErrorMessage(error);
  const authErrorType = getAuthErrorType(error);
  const isAuth = !!authErrorType;

  // Log error on mount and when error changes
  useEffect(() => {
    // Log to console (development)
    if (process.env.NODE_ENV === "development") {
      console.error("Global error boundary caught:", error);
    }

    // Log to structured logger (now client-safe)
    logger.error(
      {
        err: error,
        digest: error.digest,
        errorType: authErrorType || "general",
        isAuthError: isAuth,
        context: "GlobalErrorBoundary",
      },
      "Global error boundary triggered"
    );

    // Log to Sentry if configured
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          error: {
            digest: error.digest,
            isAuthError: isAuth,
            authErrorType: authErrorType || "none",
          },
        },
      });
    }
  }, [error, error.digest, authErrorType, isAuth]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-brand-obsidian to-brand-obsidian/95 p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Brand Logo/Title */}
        <div className="text-center">
          <h1 className="font-outfit text-3xl font-bold text-brand-porcelain">
            AI-Born
          </h1>
          <p className="mt-2 text-sm text-brand-porcelain/60">
            The Machine Core, the Human Cortex
          </p>
        </div>

        {/* Error Alert */}
        <Alert variant="destructive" className="border-2 border-destructive/50 bg-destructive/5 backdrop-blur-sm">
          <AlertTriangle className="h-6 w-6" />
          <AlertTitle className="text-xl font-semibold">{title}</AlertTitle>
          <AlertDescription className="mt-3 text-base leading-relaxed">
            {description}
          </AlertDescription>
        </Alert>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <Alert variant="warning" className="border-2 bg-amber-950/20 backdrop-blur-sm">
            <AlertTitle className="font-mono text-sm text-amber-500">
              Debug Information
            </AlertTitle>
            <AlertDescription className="mt-3 space-y-3">
              <div className="space-y-1 text-xs font-mono text-amber-400">
                <div><strong>Error Type:</strong> {authErrorType || "General"}</div>
                <div><strong>Message:</strong> {error.message}</div>
                {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
              </div>
              {error.stack && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-lg bg-amber-900/30 p-3">
                  <pre className="text-[10px] leading-tight text-amber-300">
                    {error.stack}
                  </pre>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={reset}
            variant="default"
            size="lg"
            className="gap-2 bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90"
          >
            <RefreshCw className="h-5 w-5" />
            Try again
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="lg"
            className="gap-2 border-brand-porcelain/20 text-brand-porcelain hover:bg-brand-porcelain/10"
          >
            <Home className="h-5 w-5" />
            Go home
          </Button>

          <Button
            onClick={() => (window.location.href = "/media-kit")}
            variant="outline"
            size="lg"
            className="gap-2 border-brand-ember/50 text-brand-ember hover:bg-brand-ember/10"
          >
            <Mail className="h-5 w-5" />
            Contact support
          </Button>
        </div>

        {/* Additional Information */}
        <div className="rounded-2xl border border-brand-porcelain/10 bg-brand-porcelain/5 p-6 backdrop-blur-sm">
          <h3 className="font-outfit text-sm font-semibold uppercase tracking-wider text-brand-cyan">
            What happened?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-brand-porcelain/80">
            An unexpected error prevented this page from loading correctly.
            {isAuth && " This appears to be related to authentication."} Our team
            has been automatically notified and is investigating the issue.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-brand-porcelain/60">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Support Information */}
        <div className="text-center text-sm text-brand-porcelain/60">
          <p>
            Need immediate assistance?{" "}
            <a
              href="/media-kit"
              className="font-medium text-brand-cyan underline-offset-4 hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
