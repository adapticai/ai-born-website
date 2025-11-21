/**
 * Unauthorized Access Page
 *
 * Displayed when a user attempts to access admin routes without proper privileges.
 * Provides clear messaging and next steps for users.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { auth } from '../../../auth';

/**
 * Server Component: Unauthorized Page
 *
 * Shows different messages based on authentication state:
 * - Authenticated non-admin: Clear message about insufficient privileges
 * - Unauthenticated: Should not reach here (middleware redirects to signin)
 */
export default async function UnauthorizedPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-obsidian p-6">
      <Card className="w-full max-w-2xl p-8 bg-white/5 border-white/10">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-bold text-brand-porcelain mb-2">
              Access Denied
            </h1>
            <p className="text-brand-porcelain/70 text-lg">
              {user ? (
                <>
                  Sorry, you don't have permission to access this page.
                  <br />
                  <span className="text-sm text-brand-porcelain/50 mt-2 inline-block">
                    Logged in as: {user.email}
                  </span>
                </>
              ) : (
                'You must be an administrator to access this page.'
              )}
            </p>
          </div>

          {/* Message */}
          <Card className="p-6 bg-white/5 border-white/10 text-left">
            <h2 className="text-brand-porcelain font-semibold mb-3">
              Why am I seeing this?
            </h2>
            <div className="text-brand-porcelain/70 space-y-2 text-sm">
              <p>
                This page is restricted to administrators only. Admin access is required to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Manage VIP codes and access keys</li>
                <li>View and configure A/B testing experiments</li>
                <li>Access system analytics and performance metrics</li>
                <li>Manage user accounts and permissions</li>
              </ul>
              <p className="mt-4">
                If you believe you should have access to this page, please contact the site administrator.
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-white/20 text-brand-porcelain">
                Go to Home
              </Button>
            </Link>
            {user && (
              <Link href="/account">
                <Button className="bg-brand-cyan hover:bg-brand-cyan/90 text-brand-obsidian">
                  Go to Account
                </Button>
              </Link>
            )}
            {!user && (
              <Link href="/auth/signin">
                <Button className="bg-brand-cyan hover:bg-brand-cyan/90 text-brand-obsidian">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Support */}
          <div className="text-xs text-brand-porcelain/50 pt-4 border-t border-white/10">
            <p>
              Need help? Contact support at{' '}
              <a href="mailto:support@ai-born.org" className="text-brand-cyan hover:underline">
                support@ai-born.org
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Page Metadata
 */
export const metadata = {
  title: 'Access Denied - AI-Born',
  description: 'You do not have permission to access this page.',
  robots: {
    index: false,
    follow: false,
  },
};
