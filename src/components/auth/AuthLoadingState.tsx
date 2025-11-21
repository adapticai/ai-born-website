/**
 * Auth Loading State Component
 *
 * A reusable loading state component for authentication-related UI
 * Features multiple variants for different loading contexts
 *
 * @module components/auth/AuthLoadingState
 */

import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type AuthLoadingVariant =
  | "page"
  | "button"
  | "card"
  | "form"
  | "table"
  | "list";

export interface AuthLoadingStateProps {
  /** Optional message to display */
  message?: string;
  /** Variant of the loading state */
  variant?: AuthLoadingVariant;
  /** Additional CSS classes */
  className?: string;
  /** Show spinner icon */
  showSpinner?: boolean;
  /** Number of skeleton items (for list/table variants) */
  itemCount?: number;
}

// ============================================================================
// Page Loading Variant
// ============================================================================

function PageLoadingVariant({
  message,
  showSpinner,
  className,
}: {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center space-y-8 px-4",
        className
      )}
    >
      {/* Spinner */}
      {showSpinner && (
        <Loader2 className="h-12 w-12 animate-spin text-brand-cyan" />
      )}

      {/* Message */}
      {message && (
        <p className="text-center text-lg font-medium text-brand-porcelain/70">
          {message}
        </p>
      )}

      {/* Content Skeleton */}
      <div className="w-full max-w-4xl space-y-6">
        <Skeleton className="h-12 w-3/4 bg-white/5" />
        <Skeleton className="h-8 w-full bg-white/5" />
        <Skeleton className="h-8 w-5/6 bg-white/5" />
        <div className="grid gap-4 pt-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
          <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Button Loading Variant
// ============================================================================

function ButtonLoadingVariant({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

// ============================================================================
// Card Loading Variant
// ============================================================================

function CardLoadingVariant({
  message,
  showSpinner,
  className,
}: {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-brand-obsidian/50 p-8 shadow-xl ring-1 ring-white/10",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {showSpinner && (
            <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-2/3 bg-white/5" />
            <Skeleton className="h-4 w-1/2 bg-white/5" />
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className="text-sm text-brand-porcelain/60">{message}</p>
        )}

        {/* Content */}
        <div className="space-y-3 pt-2">
          <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
          <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
          <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Form Loading Variant
// ============================================================================

function FormLoadingVariant({
  message,
  showSpinner,
  className,
}: {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(message || showSpinner) && (
        <div className="flex items-center gap-3">
          {showSpinner && (
            <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
          )}
          {message && (
            <p className="text-sm font-medium text-brand-porcelain/70">
              {message}
            </p>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-white/5" />
          <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-white/5" />
          <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-white/5" />
          <Skeleton className="h-24 w-full rounded-lg bg-white/5" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg bg-brand-cyan/20" />
      </div>
    </div>
  );
}

// ============================================================================
// Table Loading Variant
// ============================================================================

function TableLoadingVariant({
  message,
  showSpinner,
  itemCount = 5,
  className,
}: {
  message?: string;
  showSpinner?: boolean;
  itemCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(message || showSpinner) && (
        <div className="flex items-center gap-3">
          {showSpinner && (
            <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
          )}
          {message && (
            <p className="text-sm font-medium text-brand-porcelain/70">
              {message}
            </p>
          )}
        </div>
      )}

      {/* Table Header */}
      <div className="flex gap-4 border-b border-white/10 pb-3">
        <Skeleton className="h-4 w-1/4 bg-white/5" />
        <Skeleton className="h-4 w-1/3 bg-white/5" />
        <Skeleton className="h-4 w-1/4 bg-white/5" />
        <Skeleton className="h-4 w-1/6 bg-white/5" />
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="h-6 w-1/4 bg-white/5" />
            <Skeleton className="h-6 w-1/3 bg-white/5" />
            <Skeleton className="h-6 w-1/4 bg-white/5" />
            <Skeleton className="h-6 w-1/6 bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// List Loading Variant
// ============================================================================

function ListLoadingVariant({
  message,
  showSpinner,
  itemCount = 3,
  className,
}: {
  message?: string;
  showSpinner?: boolean;
  itemCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(message || showSpinner) && (
        <div className="flex items-center gap-3">
          {showSpinner && (
            <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
          )}
          {message && (
            <p className="text-sm font-medium text-brand-porcelain/70">
              {message}
            </p>
          )}
        </div>
      )}

      {/* List Items */}
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-lg bg-white/5 p-4"
          >
            <Skeleton className="h-12 w-12 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4 bg-white/5" />
              <Skeleton className="h-4 w-1/2 bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * AuthLoadingState Component
 *
 * Displays a loading state with optional message and spinner
 * Supports multiple variants for different UI contexts
 *
 * @example
 * ```tsx
 * // Page loading
 * <AuthLoadingState
 *   variant="page"
 *   message="Loading your account..."
 *   showSpinner
 * />
 *
 * // Button loading
 * <AuthLoadingState
 *   variant="button"
 *   message="Signing in..."
 * />
 *
 * // Card loading
 * <AuthLoadingState
 *   variant="card"
 *   message="Loading content..."
 *   showSpinner
 * />
 * ```
 */
export function AuthLoadingState({
  message,
  variant = "page",
  className,
  showSpinner = true,
  itemCount = 3,
}: AuthLoadingStateProps) {
  switch (variant) {
    case "button":
      return <ButtonLoadingVariant message={message} className={className} />;

    case "card":
      return (
        <CardLoadingVariant
          message={message}
          showSpinner={showSpinner}
          className={className}
        />
      );

    case "form":
      return (
        <FormLoadingVariant
          message={message}
          showSpinner={showSpinner}
          className={className}
        />
      );

    case "table":
      return (
        <TableLoadingVariant
          message={message}
          showSpinner={showSpinner}
          itemCount={itemCount}
          className={className}
        />
      );

    case "list":
      return (
        <ListLoadingVariant
          message={message}
          showSpinner={showSpinner}
          itemCount={itemCount}
          className={className}
        />
      );

    case "page":
    default:
      return (
        <PageLoadingVariant
          message={message}
          showSpinner={showSpinner}
          className={className}
        />
      );
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Pre-configured loading states for common use cases
 */
export const AuthLoadingStates = {
  /** Full page loading state */
  Page: (props?: Partial<AuthLoadingStateProps>) => (
    <AuthLoadingState variant="page" showSpinner {...props} />
  ),

  /** Button loading state */
  Button: (props?: Partial<AuthLoadingStateProps>) => (
    <AuthLoadingState variant="button" {...props} />
  ),

  /** Card loading state */
  Card: (props?: Partial<AuthLoadingStateProps>) => (
    <AuthLoadingState variant="card" showSpinner {...props} />
  ),

  /** Form loading state */
  Form: (props?: Partial<AuthLoadingStateProps>) => (
    <AuthLoadingState variant="form" showSpinner {...props} />
  ),

  /** Table loading state */
  Table: (props?: Partial<AuthLoadingStateProps>) => (
    <AuthLoadingState variant="table" showSpinner {...props} />
  ),

  /** List loading state */
  List: (props?: Partial<AuthLoadingStateProps>) => (
    <AuthLoadingState variant="list" showSpinner {...props} />
  ),
};
