/**
 * Email Sign In Example Component
 *
 * Demonstrates various usage patterns of the EmailSignInModal
 * This is for documentation/testing purposes
 *
 * @module components/auth/EmailSignInExample
 */

"use client";

import { EmailSignInButton } from "./SignInButton";

/**
 * Example implementations of the EmailSignInButton
 */
export function EmailSignInExample() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Email Sign In Examples</h2>
        <p className="text-muted-foreground mb-6">
          Various implementations of the email magic link sign-in modal
        </p>
      </div>

      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Default Button</h3>
        <EmailSignInButton />
      </div>

      {/* Outline Variant */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Outline Variant</h3>
        <EmailSignInButton variant="outline">
          Sign in with Email
        </EmailSignInButton>
      </div>

      {/* Large Size */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Large Size</h3>
        <EmailSignInButton size="lg">
          Get Started with Email
        </EmailSignInButton>
      </div>

      {/* Ghost Variant */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Ghost Variant</h3>
        <EmailSignInButton variant="ghost">
          Email Sign In
        </EmailSignInButton>
      </div>

      {/* Full Width */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Full Width</h3>
        <EmailSignInButton className="w-full">
          Continue with Email
        </EmailSignInButton>
      </div>

      {/* With Callback URL */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">With Custom Callback</h3>
        <EmailSignInButton callbackUrl="/account">
          Sign in to Account
        </EmailSignInButton>
      </div>

      {/* Brand Colors */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Brand-Styled Button</h3>
        <EmailSignInButton
          className="bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90 font-semibold"
          size="lg"
        >
          Join AI-Born
        </EmailSignInButton>
      </div>
    </div>
  );
}

/**
 * Simple integration example
 */
export function SimpleEmailSignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to AI-Born</h1>
        <p className="text-muted-foreground">
          Sign in to access your account
        </p>
        <EmailSignInButton size="lg" className="w-full">
          Sign in with Email
        </EmailSignInButton>
      </div>
    </div>
  );
}
