/**
 * Admin Dashboard: VIP Code Management
 *
 * Features:
 * - Generate new codes
 * - View existing codes
 * - Export to CSV
 * - View statistics
 *
 * SECURITY: This page requires admin authentication.
 * Admin access is verified server-side by middleware before this page loads.
 * API routes use session-based authentication (no bearer tokens needed).
 */

import { requireAdmin } from '@/lib/admin-auth';
import AdminCodesClient from './admin-codes-client';

/**
 * Server Component: Admin Codes Page
 *
 * This is the main admin codes page that performs server-side authentication.
 * The actual UI is rendered by the AdminCodesClient component.
 *
 * Authentication flow:
 * 1. Middleware checks if user is authenticated (redirects to /auth/signin if not)
 * 2. Middleware checks if user is admin (redirects to /unauthorized if not)
 * 3. This component verifies admin access again for defense in depth
 * 4. Client component renders the UI
 * 5. API calls use session cookies (no bearer tokens)
 */
export default async function AdminCodesPage() {
  // Verify admin access server-side
  // This will redirect to /auth/signin or /unauthorized if access is denied
  const user = await requireAdmin();

  // Render client component with admin user info
  return <AdminCodesClient adminEmail={user.email || ''} />;
}
