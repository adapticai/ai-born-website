/**
 * Sign In Page
 *
 * Displays authentication options for users
 * Supports Google, GitHub, and Email magic links
 *
 * @module app/auth/signin
 */

import { Suspense } from "react";

import Link from "next/link";

import {
  GoogleSignInButton,
  GitHubSignInButton,
  EmailSignInButton,
  AuthLoadingState,
} from "@/components/auth";
import { Separator } from "@/components/ui/separator";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.authSignIn;

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-obsidian px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-brand-porcelain">
            Welcome to AI-Born
          </h1>
          <p className="mt-2 text-sm text-brand-porcelain/70">
            Sign in to access your account and benefits
          </p>
        </div>

        {/* Sign In Card */}
        <div className="rounded-2xl bg-brand-obsidian/50 p-8 shadow-xl ring-1 ring-white/10">
          <Suspense
            fallback={
              <AuthLoadingState
                variant="form"
                message="Loading sign in options..."
              />
            }
          >
            <SignInForm />
          </Suspense>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-brand-porcelain/60">
          <p>
            Don't have an account?{" "}
            <Link
              href="/#excerpt"
              className="font-medium text-brand-cyan hover:text-brand-cyan/80"
            >
              Get free excerpt
            </Link>
          </p>
          <p className="mt-2">
            <Link
              href="/privacy"
              className="hover:text-brand-cyan"
            >
              Privacy Policy
            </Link>
            {" · "}
            <Link
              href="/terms"
              className="hover:text-brand-cyan"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Sign In Form Component
 */
function SignInForm() {
  return (
    <div className="space-y-4">
      {/* OAuth Providers */}
      <div className="space-y-3">
        <GoogleSignInButton
          variant="outline"
          className="w-full border-white/10 bg-white/5 text-brand-porcelain hover:bg-white/10"
        />

        <GitHubSignInButton
          variant="outline"
          className="w-full border-white/10 bg-white/5 text-brand-porcelain hover:bg-white/10"
        />
      </div>

      {/* Separator */}
      <div className="relative">
        <Separator className="bg-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-brand-obsidian px-2 text-xs text-brand-porcelain/60">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email Sign In */}
      <EmailSignInButton
        variant="default"
        className="w-full bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90"
      />

      {/* Info Text */}
      <p className="text-xs text-brand-porcelain/50">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-brand-cyan">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-brand-cyan">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

