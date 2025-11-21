/**
 * Sign Up Page
 *
 * User registration page with authentication options
 * Highlights benefits of creating an account
 * Matches AI-Born institutional design language
 *
 * @module app/signup
 */

import { Suspense } from "react";
import {
  GoogleSignInButton,
  GitHubSignInButton,
  EmailSignInButton,
} from "@/components/auth/SignInButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { pageMetadata, generatePageMetadata } from "@/lib/metadata";
import { SignUpPageTracker } from "@/components/auth/SignUpPageTracker";

export const metadata = generatePageMetadata({
  title: "Sign Up",
  description:
    "Create your AI-Born account to access exclusive content, pre-order bonuses, and updates.",
  path: "/signup",
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-obsidian px-4 py-12">
      {/* Analytics tracker */}
      <SignUpPageTracker />

      <div className="w-full max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Benefits */}
          <div className="flex flex-col justify-center space-y-8" data-section="benefits">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-brand-porcelain">
                Join AI-Born
              </h1>
              <p className="mt-3 text-lg text-brand-porcelain/70">
                Create an account to access exclusive content and stay updated
                on the future of AI-native organisations.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              <BenefitItem
                icon={<BookIcon />}
                title="Instant access to free excerpt"
                description="Download a design-polished sample chapter immediately upon sign-up"
              />
              <BenefitItem
                icon={<GiftIcon />}
                title="Pre-order bonus pack"
                description="Upload proof of purchase to receive the Agent Charter Pack and COI diagnostic tool"
              />
              <BenefitItem
                icon={<BellIcon />}
                title="Launch updates and early access"
                description="Be first to know about publication milestones, speaking events, and new content"
              />
              <BenefitItem
                icon={<SparklesIcon />}
                title="Exclusive community insights"
                description="Join a curated network of leaders building AI-native institutions"
              />
            </div>

            {/* Trust Indicators */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-brand-porcelain/60">
                Your privacy matters. We never share your data. Unsubscribe
                anytime with one click.
              </p>
            </div>
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="flex flex-col justify-center">
            <Card className="border-white/10 bg-brand-obsidian/50 shadow-2xl">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl text-brand-porcelain">
                  Create your account
                </CardTitle>
                <CardDescription className="text-brand-porcelain/70">
                  Choose your preferred sign-up method
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Suspense fallback={<LoadingState />}>
                  <SignUpForm />
                </Suspense>
              </CardContent>

              <CardFooter className="flex-col space-y-4">
                <Separator className="bg-white/10" />
                <div className="text-center text-sm text-brand-porcelain/60">
                  <p>
                    Already have an account?{" "}
                    <Link
                      href="/auth/signin"
                      className="font-medium text-brand-cyan hover:text-brand-cyan/80 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </Card>

            {/* Legal Links */}
            <div className="mt-6 text-center text-xs text-brand-porcelain/50">
              <p>
                By creating an account, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline hover:text-brand-cyan transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-brand-cyan transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sign Up Form Component
 */
function SignUpForm() {
  return (
    <div className="space-y-4">
      {/* OAuth Providers */}
      <div className="space-y-3">
        <GoogleSignInButton
          variant="outline"
          className="w-full border-white/10 bg-white/5 text-brand-porcelain hover:bg-white/10 transition-colors"
          callbackUrl="/"
        />

        <GitHubSignInButton
          variant="outline"
          className="w-full border-white/10 bg-white/5 text-brand-porcelain hover:bg-white/10 transition-colors"
          callbackUrl="/"
        />
      </div>

      {/* Separator */}
      <div className="relative py-2">
        <Separator className="bg-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-brand-obsidian px-3 text-xs text-brand-porcelain/60">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email Sign Up */}
      <EmailSignInButton
        variant="default"
        className="w-full bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90 transition-colors font-medium"
        callbackUrl="/"
      >
        Sign up with email
      </EmailSignInButton>

      {/* Security Note */}
      <div className="flex items-start gap-2 rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 p-3">
        <ShieldIcon />
        <p className="text-xs text-brand-porcelain/70">
          We use secure authentication. Your password is never stored or shared.
        </p>
      </div>
    </div>
  );
}

/**
 * Benefit Item Component
 */
function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-ember/20 ring-1 ring-white/10">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-brand-porcelain">{title}</h3>
        <p className="mt-1 text-sm text-brand-porcelain/60">{description}</p>
      </div>
    </div>
  );
}

/**
 * Loading State
 */
function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="h-11 w-full animate-pulse rounded-lg bg-white/5" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-white/5" />
      <div className="h-px w-full animate-pulse bg-white/5" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-white/5" />
    </div>
  );
}

// Icons

function BookIcon() {
  return (
    <svg
      className="h-6 w-6 text-brand-cyan"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      className="h-6 w-6 text-brand-ember"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="h-6 w-6 text-brand-cyan"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      className="h-6 w-6 text-brand-ember"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-brand-cyan"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}
