/**
 * Sign Out Button Component
 *
 * Triggers NextAuth sign-out flow
 * Handles session cleanup and redirection
 *
 * @module components/auth/SignOutButton
 */

"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface SignOutButtonProps {
  /**
   * URL to redirect to after sign-out
   * Defaults to home page
   */
  callbackUrl?: string;

  /**
   * Button variant
   */
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";

  /**
   * Button size
   */
  size?: "default" | "sm" | "lg" | "icon";

  /**
   * Custom button text
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Show loading state
   */
  showLoading?: boolean;

  /**
   * Callback function after sign-out
   */
  onSignOut?: () => void;
}

/**
 * Sign Out Button
 * Handles sign-out via NextAuth
 */
export function SignOutButton({
  callbackUrl = "/",
  variant = "ghost",
  size = "default",
  children,
  className,
  showLoading = true,
  onSignOut,
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);

      // Call callback if provided
      onSignOut?.();

      // Sign out via NextAuth
      await signOut({
        callbackUrl,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading && showLoading ? "Signing out..." : children || "Sign out"}
    </Button>
  );
}
