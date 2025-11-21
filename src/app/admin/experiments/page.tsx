/**
 * A/B Testing Admin Dashboard
 *
 * Provides a comprehensive interface for managing and analyzing experiments:
 * - List all experiments with status
 * - View variant performance metrics
 * - Statistical significance calculator
 * - Start/stop experiments
 * - Force specific variants for testing
 *
 * SECURITY: This page requires admin authentication.
 * Admin access is verified server-side by middleware and requireAdmin().
 *
 * This is a production-ready dashboard with real-time metrics and analysis.
 */

import { requireAdmin } from '@/lib/admin-auth';
import ExperimentsAdminClient from './experiments-admin-client';

/**
 * Server Component: Admin Experiments Page
 *
 * Verifies admin access server-side before rendering the client component.
 */
export default async function ExperimentsAdminPage() {
  // Verify admin access server-side
  const user = await requireAdmin();

  // Render client component
  return <ExperimentsAdminClient adminEmail={user.email || ''} />;
}
