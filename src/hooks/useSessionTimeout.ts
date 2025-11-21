/**
 * Session Timeout Hook
 *
 * Custom hook that monitors session expiration and provides callbacks
 * for different timeout thresholds.
 *
 * @module hooks/useSessionTimeout
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * Session timeout thresholds in milliseconds
 */
const TIMEOUT_THRESHOLDS = {
  /** Show warning 5 minutes before expiration */
  WARNING: 5 * 60 * 1000,
  /** Show critical warning 1 minute before expiration */
  CRITICAL: 1 * 60 * 1000,
  /** Check interval for session status (every 30 seconds) */
  CHECK_INTERVAL: 30 * 1000,
} as const;

/**
 * Session timeout state
 */
export interface SessionTimeoutState {
  /** Whether the session is expiring soon (within warning threshold) */
  isExpiring: boolean;
  /** Whether the session has expired */
  isExpired: boolean;
  /** Time remaining in milliseconds until expiration */
  timeRemaining: number;
  /** Whether the session is in critical expiration window */
  isCritical: boolean;
  /** Formatted time remaining (e.g., "4m 32s") */
  formattedTimeRemaining: string;
}

/**
 * Callback function signatures
 */
export interface SessionTimeoutCallbacks {
  /** Called when session enters warning threshold */
  onWarning?: () => void;
  /** Called when session enters critical threshold */
  onCritical?: () => void;
  /** Called when session expires */
  onExpired?: () => void;
}

/**
 * Format milliseconds into a readable time string
 */
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "0s";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${seconds}s`;
}

/**
 * Custom hook for session timeout monitoring
 *
 * Monitors the NextAuth session and triggers callbacks at different
 * timeout thresholds. Provides real-time state about session expiration.
 *
 * @param callbacks - Optional callbacks for timeout events
 * @returns Session timeout state
 *
 * @example
 * ```tsx
 * const { isExpiring, isExpired, timeRemaining } = useSessionTimeout({
 *   onWarning: () => toast.warning("Session expiring soon"),
 *   onExpired: () => showSignInModal()
 * });
 * ```
 */
export function useSessionTimeout(
  callbacks?: SessionTimeoutCallbacks
): SessionTimeoutState {
  const { data: session, status } = useSession();

  const [timeRemaining, setTimeRemaining] = useState<number>(Infinity);
  const [isExpiring, setIsExpiring] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Track if callbacks have been called to prevent duplicates
  const warningCalledRef = useRef(false);
  const criticalCalledRef = useRef(false);
  const expiredCalledRef = useRef(false);

  /**
   * Calculate time remaining until session expiration
   */
  const calculateTimeRemaining = useCallback((): number => {
    if (status !== "authenticated" || !session?.expires) {
      return Infinity;
    }

    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();
    const remaining = expiresAt - now;

    return Math.max(0, remaining);
  }, [session, status]);

  /**
   * Update session state based on time remaining
   */
  const updateSessionState = useCallback(() => {
    const remaining = calculateTimeRemaining();
    setTimeRemaining(remaining);

    // Session expired
    if (remaining <= 0) {
      setIsExpired(true);
      setIsExpiring(true);
      setIsCritical(true);

      if (!expiredCalledRef.current && callbacks?.onExpired) {
        expiredCalledRef.current = true;
        callbacks.onExpired();
      }
      return;
    }

    // Critical threshold (1 minute)
    if (remaining <= TIMEOUT_THRESHOLDS.CRITICAL) {
      setIsCritical(true);
      setIsExpiring(true);

      if (!criticalCalledRef.current && callbacks?.onCritical) {
        criticalCalledRef.current = true;
        callbacks.onCritical();
      }
      return;
    }

    // Warning threshold (5 minutes)
    if (remaining <= TIMEOUT_THRESHOLDS.WARNING) {
      setIsExpiring(true);

      if (!warningCalledRef.current && callbacks?.onWarning) {
        warningCalledRef.current = true;
        callbacks.onWarning();
      }
      return;
    }

    // Normal state - reset flags
    setIsExpiring(false);
    setIsCritical(false);
    setIsExpired(false);
  }, [calculateTimeRemaining, callbacks]);

  /**
   * Reset callback flags when session changes
   */
  useEffect(() => {
    warningCalledRef.current = false;
    criticalCalledRef.current = false;
    expiredCalledRef.current = false;
  }, [session?.expires]);

  /**
   * Set up interval to check session status
   */
  useEffect(() => {
    if (status !== "authenticated") {
      setTimeRemaining(Infinity);
      setIsExpiring(false);
      setIsCritical(false);
      setIsExpired(false);
      return;
    }

    // Initial check
    updateSessionState();

    // Set up interval for continuous monitoring
    const interval = setInterval(
      updateSessionState,
      TIMEOUT_THRESHOLDS.CHECK_INTERVAL
    );

    return () => clearInterval(interval);
  }, [status, updateSessionState]);

  return {
    isExpiring,
    isExpired,
    timeRemaining,
    isCritical,
    formattedTimeRemaining: formatTimeRemaining(timeRemaining),
  };
}
