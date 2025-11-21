/**
 * Auth Buttons Component
 *
 * Displays Sign In and Sign Up buttons for non-authenticated users
 * Responsive design that stacks on mobile, side-by-side on desktop
 *
 * @module components/auth/AuthButtons
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AuthButtonsProps {
  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Button variant for Sign In
   * @default "outline"
   */
  signInVariant?: "default" | "outline" | "ghost" | "secondary";

  /**
   * Button variant for Sign Up
   * @default "default"
   */
  signUpVariant?: "default" | "outline" | "ghost" | "secondary";

  /**
   * Button size
   * @default "default"
   */
  size?: "default" | "sm" | "lg";

  /**
   * Show buttons side by side on mobile
   * @default false
   */
  inline?: boolean;

  /**
   * Custom text for Sign In button
   * @default "Sign in"
   */
  signInText?: string;

  /**
   * Custom text for Sign Up button
   * @default "Sign up"
   */
  signUpText?: string;

  /**
   * Callback URL after successful authentication
   */
  callbackUrl?: string;
}

/**
 * Auth Buttons Component
 *
 * Renders Sign In and Sign Up buttons with responsive layout
 * Stacks vertically on mobile, horizontal on desktop (unless inline prop is true)
 */
export function AuthButtons({
  className,
  signInVariant = "outline",
  signUpVariant = "default",
  size = "default",
  inline = false,
  signInText = "Sign in",
  signUpText = "Sign up",
  callbackUrl,
}: AuthButtonsProps) {
  // Build callback URL query string
  const callbackQuery = callbackUrl
    ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "";

  return (
    <div
      className={cn(
        "flex gap-3",
        inline
          ? "flex-row items-center"
          : "flex-col sm:flex-row items-stretch sm:items-center",
        className
      )}
    >
      {/* Sign In Button */}
      <Button variant={signInVariant} size={size} asChild>
        <Link href={`/auth/signin${callbackQuery}`}>{signInText}</Link>
      </Button>

      {/* Sign Up Button */}
      <Button variant={signUpVariant} size={size} asChild>
        <Link href={`/signup${callbackQuery}`}>{signUpText}</Link>
      </Button>
    </div>
  );
}

/**
 * Compact Auth Buttons
 *
 * Pre-configured variant for tight spaces (headers, modals)
 * Uses smaller size and always inline
 */
export function CompactAuthButtons(props: Omit<AuthButtonsProps, "size" | "inline">) {
  return <AuthButtons {...props} size="sm" inline />;
}

/**
 * Large Auth Buttons
 *
 * Pre-configured variant for hero sections and prominent CTAs
 * Uses larger size for better visibility
 */
export function LargeAuthButtons(props: Omit<AuthButtonsProps, "size">) {
  return <AuthButtons {...props} size="lg" />;
}

/**
 * Brand-Styled Auth Buttons
 *
 * Uses brand colors for a more distinctive appearance
 * Primary button uses brand cyan accent
 */
export function BrandAuthButtons({
  className,
  ...props
}: Omit<AuthButtonsProps, "signInVariant" | "signUpVariant">) {
  return (
    <div
      className={cn(
        "flex gap-3",
        props.inline
          ? "flex-row items-center"
          : "flex-col sm:flex-row items-stretch sm:items-center",
        className
      )}
    >
      {/* Sign In Button - Outline style */}
      <Button
        variant="outline"
        size={props.size || "default"}
        asChild
        className="border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10"
      >
        <Link
          href={`/auth/signin${
            props.callbackUrl
              ? `?callbackUrl=${encodeURIComponent(props.callbackUrl)}`
              : ""
          }`}
        >
          {props.signInText || "Sign in"}
        </Link>
      </Button>

      {/* Sign Up Button - Filled with brand cyan */}
      <Button
        variant="default"
        size={props.size || "default"}
        asChild
        className="bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90 font-medium"
      >
        <Link
          href={`/signup${
            props.callbackUrl
              ? `?callbackUrl=${encodeURIComponent(props.callbackUrl)}`
              : ""
          }`}
        >
          {props.signUpText || "Sign up"}
        </Link>
      </Button>
    </div>
  );
}
