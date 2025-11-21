/**
 * Session Timeout Component
 *
 * Monitors session expiration and provides user feedback through:
 * - Toast notifications before expiration
 * - Modal dialog when session expires
 * - Automatic session refresh for active users
 *
 * @module components/auth/SessionTimeout
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { LogIn, Clock, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

/**
 * Session refresh configuration
 */
const SESSION_CONFIG = {
  /** Refresh session if user is active within this window (10 minutes) */
  REFRESH_WINDOW: 10 * 60 * 1000,
  /** Consider user active if interaction within this period (5 minutes) */
  ACTIVITY_THRESHOLD: 5 * 60 * 1000,
  /** Debounce time for activity events (1 second) */
  ACTIVITY_DEBOUNCE: 1000,
} as const;

/**
 * User activity events to monitor
 */
const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

/**
 * Session Timeout Component
 *
 * Provides comprehensive session timeout handling:
 * - Monitors session expiration
 * - Shows toast warnings at 5 minutes and 1 minute
 * - Displays modal when session expires
 * - Automatically refreshes session for active users
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <SessionProvider>
 *   <SessionTimeout />
 *   {children}
 * </SessionProvider>
 * ```
 */
export function SessionTimeout() {
  const { data: session, status, update } = useSession();
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  // Track if toasts have been shown to prevent duplicates
  const warningToastShownRef = useRef(false);
  const criticalToastShownRef = useRef(false);

  /**
   * Handle session warning (5 minutes before expiration)
   */
  const handleWarning = useCallback(() => {
    if (warningToastShownRef.current) return;

    warningToastShownRef.current = true;

    toast.warning("Session Expiring Soon", {
      description: "Your session will expire in 5 minutes. Save your work.",
      icon: <Clock className="h-4 w-4" />,
      duration: 10000,
      className: "bg-brand-ember/10 border-brand-ember",
    });
  }, []);

  /**
   * Handle critical warning (1 minute before expiration)
   */
  const handleCritical = useCallback(() => {
    if (criticalToastShownRef.current) return;

    criticalToastShownRef.current = true;

    toast.error("Session Expiring", {
      description: "Your session will expire in 1 minute!",
      icon: <AlertTriangle className="h-4 w-4" />,
      duration: 30000,
      className: "bg-red-50 border-red-500 dark:bg-red-950 dark:border-red-500",
    });
  }, []);

  /**
   * Handle session expiration
   */
  const handleExpired = useCallback(() => {
    setShowExpiredModal(true);

    toast.error("Session Expired", {
      description: "Please sign in again to continue.",
      icon: <LogIn className="h-4 w-4" />,
      duration: Infinity,
      className: "bg-red-50 border-red-500 dark:bg-red-950 dark:border-red-500",
    });
  }, []);

  /**
   * Use session timeout hook
   */
  const { isExpiring, isExpired, formattedTimeRemaining, timeRemaining } =
    useSessionTimeout({
      onWarning: handleWarning,
      onCritical: handleCritical,
      onExpired: handleExpired,
    });

  /**
   * Reset toast flags when session changes
   */
  useEffect(() => {
    if (status === "authenticated" && !isExpiring) {
      warningToastShownRef.current = false;
      criticalToastShownRef.current = false;
    }
  }, [status, isExpiring]);

  /**
   * Update last activity time (debounced)
   */
  const updateActivity = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  /**
   * Track user activity for session refresh
   */
  useEffect(() => {
    if (status !== "authenticated") return;

    let timeoutId: NodeJS.Timeout;

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateActivity, SESSION_CONFIG.ACTIVITY_DEBOUNCE);
    };

    // Add event listeners for user activity
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, debouncedUpdate, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, debouncedUpdate);
      });
    };
  }, [status, updateActivity]);

  /**
   * Automatic session refresh for active users
   */
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const checkAndRefresh = async () => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      const isUserActive = timeSinceActivity < SESSION_CONFIG.ACTIVITY_THRESHOLD;

      // Only refresh if:
      // 1. User has been active recently
      // 2. Session is approaching expiration (within refresh window)
      // 3. Session hasn't expired yet
      if (
        isUserActive &&
        timeRemaining > 0 &&
        timeRemaining < SESSION_CONFIG.REFRESH_WINDOW
      ) {
        try {
          await update();

          // Reset toast flags after successful refresh
          warningToastShownRef.current = false;
          criticalToastShownRef.current = false;

          toast.success("Session Extended", {
            description: "Your session has been automatically renewed.",
            duration: 3000,
            className: "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-500",
          });
        } catch (error) {
          console.error("Failed to refresh session:", error);
        }
      }
    };

    // Check for refresh every minute when session is expiring
    if (isExpiring && !isExpired) {
      const interval = setInterval(checkAndRefresh, 60000);
      return () => clearInterval(interval);
    }
  }, [
    status,
    session,
    isExpiring,
    isExpired,
    lastActivityTime,
    timeRemaining,
    update,
  ]);

  /**
   * Handle sign in from expired modal
   */
  const handleSignIn = useCallback(async () => {
    setShowExpiredModal(false);

    // Get current URL for redirect after sign in
    const callbackUrl = window.location.href;

    // Trigger sign in
    await signIn(undefined, { callbackUrl });
  }, []);

  /**
   * Don't render anything if user is not authenticated
   */
  if (status !== "authenticated") {
    return null;
  }

  return (
    <>
      {/* Expired Session Modal */}
      <AlertDialog open={showExpiredModal} onOpenChange={setShowExpiredModal}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-ember/10">
              <AlertTriangle className="h-6 w-6 text-brand-ember" />
            </div>
            <AlertDialogTitle className="text-center font-outfit text-xl font-bold">
              Session Expired
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-inter">
              Your session has expired for security reasons. Please sign in
              again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              onClick={handleSignIn}
              className="w-full bg-black font-outfit font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100 sm:w-auto"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden status display for debugging (only in development) */}
      {process.env.NODE_ENV === "development" && isExpiring && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-brand-cyan bg-white p-3 text-xs shadow-lg dark:bg-black">
          <div className="font-semibold text-brand-cyan">
            Session Debug Info
          </div>
          <div className="mt-1 space-y-1 text-slate-600 dark:text-slate-400">
            <div>Time remaining: {formattedTimeRemaining}</div>
            <div>Is expiring: {isExpiring ? "Yes" : "No"}</div>
            <div>Is expired: {isExpired ? "Yes" : "No"}</div>
          </div>
        </div>
      )}
    </>
  );
}
