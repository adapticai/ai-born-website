"use client";

/**
 * Authentication Error Boundary Component
 *
 * A React error boundary specifically designed for authentication-related errors.
 * Provides beautiful error UI using shadcn/ui Alert component with contextual
 * error messages and recovery actions.
 *
 * Features:
 * - Catches and handles auth-specific errors
 * - Beautiful error UI with brand styling
 * - Different error messages for different error types
 * - Recovery actions (retry, sign in again)
 * - Automatic error logging to console and Sentry
 * - Accessible error messages
 *
 * @module components/auth/AuthErrorBoundary
 */

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, LogIn, Home } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthErrorType } from "@/types/auth";
import { logger } from "@/lib/logger";

// ============================================================================
// Types
// ============================================================================

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorType: AuthErrorType;
}

// ============================================================================
// Error Type Detection
// ============================================================================

/**
 * Determine the auth error type from an error object
 */
function getAuthErrorType(error: Error): AuthErrorType {
  const message = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  // Check for specific error patterns
  if (message.includes("configuration") || errorName.includes("configuration")) {
    return AuthErrorType.Configuration;
  }

  if (message.includes("access denied") || message.includes("accessdenied")) {
    return AuthErrorType.AccessDenied;
  }

  if (message.includes("verification") || message.includes("verify")) {
    return AuthErrorType.Verification;
  }

  if (message.includes("oauth") && message.includes("signin")) {
    return AuthErrorType.OAuthSignin;
  }

  if (message.includes("oauth") && message.includes("callback")) {
    return AuthErrorType.OAuthCallback;
  }

  if (message.includes("oauth") && message.includes("account")) {
    return AuthErrorType.OAuthCreateAccount;
  }

  if (message.includes("email") && message.includes("account")) {
    return AuthErrorType.EmailCreateAccount;
  }

  if (message.includes("callback")) {
    return AuthErrorType.Callback;
  }

  if (message.includes("account not linked") || message.includes("oauthaccountnotlinked")) {
    return AuthErrorType.OAuthAccountNotLinked;
  }

  if (message.includes("email") && message.includes("signin")) {
    return AuthErrorType.EmailSignin;
  }

  if (message.includes("credentials")) {
    return AuthErrorType.CredentialsSignin;
  }

  if (message.includes("session required") || message.includes("unauthorized")) {
    return AuthErrorType.SessionRequired;
  }

  return AuthErrorType.Default;
}

/**
 * Get user-friendly error message for each error type
 */
function getErrorMessage(errorType: AuthErrorType): {
  title: string;
  description: string;
} {
  const messages: Record<AuthErrorType, { title: string; description: string }> = {
    [AuthErrorType.Configuration]: {
      title: "Configuration error",
      description: "There is a problem with the authentication configuration. Please contact support if this persists.",
    },
    [AuthErrorType.AccessDenied]: {
      title: "Access denied",
      description: "You do not have permission to access this resource. Please sign in with an authorised account.",
    },
    [AuthErrorType.Verification]: {
      title: "Verification failed",
      description: "We could not verify your email address. Please check your inbox for the verification link or request a new one.",
    },
    [AuthErrorType.OAuthSignin]: {
      title: "Sign-in error",
      description: "There was a problem signing in with your provider. Please try again or use a different sign-in method.",
    },
    [AuthErrorType.OAuthCallback]: {
      title: "Authentication callback error",
      description: "There was a problem completing the authentication process. Please try signing in again.",
    },
    [AuthErrorType.OAuthCreateAccount]: {
      title: "Account creation error",
      description: "We could not create your account using this provider. Please try a different sign-in method.",
    },
    [AuthErrorType.EmailCreateAccount]: {
      title: "Account creation error",
      description: "We could not create your account with this email address. Please try again or contact support.",
    },
    [AuthErrorType.Callback]: {
      title: "Authentication error",
      description: "There was a problem completing authentication. Please try signing in again.",
    },
    [AuthErrorType.OAuthAccountNotLinked]: {
      title: "Account not linked",
      description: "This account is already associated with a different sign-in method. Please sign in using your original method.",
    },
    [AuthErrorType.EmailSignin]: {
      title: "Email sign-in error",
      description: "We could not send a sign-in link to your email. Please check your email address and try again.",
    },
    [AuthErrorType.CredentialsSignin]: {
      title: "Invalid credentials",
      description: "The credentials you provided are incorrect. Please check your details and try again.",
    },
    [AuthErrorType.SessionRequired]: {
      title: "Authentication required",
      description: "You must be signed in to access this page. Please sign in to continue.",
    },
    [AuthErrorType.Default]: {
      title: "Authentication error",
      description: "An unexpected error occurred during authentication. Please try again or contact support if the problem persists.",
    },
  };

  return messages[errorType];
}

// ============================================================================
// Error UI Component
// ============================================================================

interface AuthErrorUIProps {
  error: Error;
  errorType: AuthErrorType;
  onReset: () => void;
}

/**
 * Beautiful error UI component
 */
function AuthErrorUI({ error, errorType, onReset }: AuthErrorUIProps) {
  const { title, description } = getErrorMessage(errorType);
  const showSignInButton = errorType === AuthErrorType.SessionRequired;
  const showRetryButton = ![AuthErrorType.SessionRequired, AuthErrorType.AccessDenied].includes(errorType);

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Error Alert */}
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
          <AlertDescription className="mt-2 text-sm leading-relaxed">
            {description}
          </AlertDescription>
        </Alert>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertTitle className="text-sm font-mono text-amber-900 dark:text-amber-500">
              Debug Information
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <div className="text-xs font-mono text-amber-800 dark:text-amber-400">
                <div><strong>Error Type:</strong> {errorType}</div>
                <div><strong>Message:</strong> {error.message}</div>
                {error.stack && (
                  <div className="mt-2 max-h-32 overflow-y-auto rounded bg-amber-100 p-2 dark:bg-amber-900/30">
                    <pre className="text-[10px] leading-tight">{error.stack}</pre>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {showRetryButton && (
            <Button
              onClick={onReset}
              variant="default"
              className="gap-2"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          )}

          {showSignInButton && (
            <Button
              onClick={() => window.location.href = "/auth/signin"}
              variant="default"
              className="gap-2"
              size="lg"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          )}

          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <Home className="h-4 w-4" />
            Go home
          </Button>
        </div>

        {/* Support Link */}
        <div className="text-center text-sm text-muted-foreground">
          Need help?{" "}
          <a
            href="/media-kit"
            className="font-medium text-brand-cyan underline-offset-4 hover:underline"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary Component
// ============================================================================

/**
 * React Error Boundary for authentication errors
 *
 * @example
 * ```tsx
 * <AuthErrorBoundary>
 *   <ProtectedContent />
 * </AuthErrorBoundary>
 * ```
 *
 * @example Custom fallback
 * ```tsx
 * <AuthErrorBoundary
 *   fallback={(error, reset) => (
 *     <CustomErrorUI error={error} onRetry={reset} />
 *   )}
 * >
 *   <ProtectedContent />
 * </AuthErrorBoundary>
 * ```
 */
export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: AuthErrorType.Default,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    const errorType = getAuthErrorType(error);

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console (development)
    if (process.env.NODE_ENV === "development") {
      console.error("AuthErrorBoundary caught an error:", error, errorInfo);
    }

    // Log to structured logger
    logger.error({
      err: error,
      errorType: this.state.errorType,
      componentStack: errorInfo.componentStack,
      context: "AuthErrorBoundary",
    }, "Authentication error boundary triggered");

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to Sentry if configured
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
          auth: {
            errorType: this.state.errorType,
          },
        },
      });
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorType: AuthErrorType.Default,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetErrorBoundary);
      }

      // Use default error UI
      return (
        <AuthErrorUI
          error={this.state.error}
          errorType={this.state.errorType}
          onReset={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default AuthErrorBoundary;
