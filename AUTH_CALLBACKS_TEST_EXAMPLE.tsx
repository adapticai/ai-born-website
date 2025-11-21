/**
 * Auth Callbacks Test Example
 *
 * This file demonstrates how to test the enhanced auth callbacks
 * and verify that session.user includes all custom entitlement fields.
 *
 * To use this:
 * 1. Copy to src/app/test-auth/page.tsx (create folder if needed)
 * 2. Sign in via any provider
 * 3. Navigate to /test-auth
 * 4. Verify all fields are populated correctly
 *
 * DO NOT deploy this to production. This is for testing only.
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TestAuthPage() {
  const session = await auth();

  // Require authentication
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/test-auth");
  }

  const { user } = session;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Auth Callbacks Test Page</h1>

      <div className="space-y-6">
        {/* Basic User Info */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic User Information</h2>
          <dl className="space-y-2">
            <div className="flex gap-4">
              <dt className="font-medium w-32">ID:</dt>
              <dd className="font-mono text-sm">{user.id}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="font-medium w-32">Email:</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="font-medium w-32">Name:</dt>
              <dd>{user.name || <em className="text-gray-500">Not set</em>}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="font-medium w-32">Image:</dt>
              <dd>
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="w-12 h-12 rounded-full" />
                ) : (
                  <em className="text-gray-500">No image</em>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* Custom Entitlement Fields */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Entitlement Fields (Custom)</h2>
          <dl className="space-y-2">
            <div className="flex gap-4">
              <dt className="font-medium w-48">Has Pre-ordered:</dt>
              <dd>
                <StatusBadge value={user.hasPreordered} />
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="font-medium w-48">Has Excerpt Access:</dt>
              <dd>
                <StatusBadge value={user.hasExcerpt} />
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="font-medium w-48">Has Agent Charter Pack:</dt>
              <dd>
                <StatusBadge value={user.hasAgentCharterPack} />
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="font-medium w-48">Account Created:</dt>
              <dd>
                {user.createdAt ? (
                  <span className="font-mono text-sm">
                    {new Date(user.createdAt).toLocaleString()}
                  </span>
                ) : (
                  <em className="text-gray-500">Not available</em>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* Full Session Object */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Full Session Object</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </section>

        {/* Validation Status */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Validation Status</h2>
          <ValidationChecklist user={user} />
        </section>

        {/* Next Steps */}
        <section className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
          <h2 className="text-xl font-semibold mb-4">Next Steps for Testing</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Upload a receipt</strong> to test <code>hasPreordered</code> flag
              <br />
              <a href="/bonus-pack/claim" className="text-blue-600 hover:underline ml-6">
                → Go to Bonus Claim
              </a>
            </li>
            <li>
              <strong>Request excerpt</strong> to test <code>hasExcerpt</code> flag
              <br />
              <a href="/#excerpt" className="text-blue-600 hover:underline ml-6">
                → Go to Excerpt Section
              </a>
            </li>
            <li>
              <strong>Claim bonus pack</strong> to test <code>hasAgentCharterPack</code> flag
              <br />
              <em className="text-gray-600 ml-6">
                (Requires verified receipt first)
              </em>
            </li>
            <li>
              <strong>Sign out and sign in again</strong> to verify persistence
              <br />
              <a href="/auth/signout" className="text-blue-600 hover:underline ml-6">
                → Sign Out
              </a>
            </li>
          </ol>
        </section>

        {/* Developer Notes */}
        <section className="border rounded-lg p-6 bg-yellow-50 dark:bg-yellow-900/20">
          <h2 className="text-xl font-semibold mb-4">Developer Notes</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Entitlements are fetched from the database during sign-in (JWT callback)
            </li>
            <li>
              Entitlements are cached in the JWT token (valid for 24 hours by default)
            </li>
            <li>
              To force refresh: Use <code>update()</code> from next-auth/react
            </li>
            <li>
              Check browser console and server logs for structured logging output
            </li>
            <li>
              Database queries run in parallel for performance (3 queries total)
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ value }: { value?: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Yes
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        No
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      Undefined
    </span>
  );
}

/**
 * Validation Checklist Component
 */
function ValidationChecklist({ user }: { user: any }) {
  const checks = [
    {
      name: "User ID present",
      passed: !!user.id,
      required: true,
    },
    {
      name: "Email present",
      passed: !!user.email,
      required: true,
    },
    {
      name: "hasPreordered field exists",
      passed: "hasPreordered" in user,
      required: true,
    },
    {
      name: "hasExcerpt field exists",
      passed: "hasExcerpt" in user,
      required: true,
    },
    {
      name: "hasAgentCharterPack field exists",
      passed: "hasAgentCharterPack" in user,
      required: true,
    },
    {
      name: "createdAt field exists",
      passed: "createdAt" in user,
      required: true,
    },
    {
      name: "hasPreordered is boolean",
      passed: typeof user.hasPreordered === "boolean" || user.hasPreordered === undefined,
      required: true,
    },
    {
      name: "hasExcerpt is boolean",
      passed: typeof user.hasExcerpt === "boolean" || user.hasExcerpt === undefined,
      required: true,
    },
    {
      name: "hasAgentCharterPack is boolean",
      passed: typeof user.hasAgentCharterPack === "boolean" || user.hasAgentCharterPack === undefined,
      required: true,
    },
    {
      name: "createdAt is Date or undefined",
      passed:
        user.createdAt === undefined ||
        user.createdAt instanceof Date ||
        typeof user.createdAt === "string",
      required: true,
    },
  ];

  const allPassed = checks.filter((c) => c.required).every((c) => c.passed);

  return (
    <div>
      <div className="mb-4">
        {allPassed ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <strong>All checks passed!</strong>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
            </svg>
            <strong>Some checks failed</strong>
          </div>
        )}
      </div>

      <ul className="space-y-1">
        {checks.map((check, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            {check.passed ? (
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className={check.passed ? "text-gray-700 dark:text-gray-300" : "text-red-600 dark:text-red-400"}>
              {check.name}
              {check.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        * Required fields must pass for auth callbacks to work correctly
      </p>
    </div>
  );
}
