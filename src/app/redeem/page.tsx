import { RedeemForm } from '@/components/redeem/RedeemForm';
import { Background } from '@/components/background';
import { pageMetadata } from '@/lib/metadata';
import { getCurrentUser } from '@/lib/auth';

/**
 * VIP Code Redemption Page
 * Allows users to redeem VIP access codes for exclusive benefits
 *
 * Features:
 * - Auto-fills email for authenticated users
 * - Associates redemptions with user accounts
 * - Redirects to downloads page after successful redemption
 */

export const metadata = pageMetadata.redeem;

export default async function RedeemPage() {
  // Get current user if authenticated
  const user = await getCurrentUser();

  return (
    <Background>
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-brand-porcelain lg:text-5xl">
              Redeem VIP Code
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Enter your 6-character VIP code to unlock exclusive benefits, early access, and bonus content.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="mb-12">
            <h2 className="mb-6 text-center text-2xl font-semibold text-brand-porcelain">
              VIP Benefits
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <BenefitCard
                icon="🎁"
                title="Exclusive Content"
                description="Access to bonus chapters, extended frameworks, and additional resources not available to the general public."
              />
              <BenefitCard
                icon="⚡"
                title="Early Access"
                description="Be the first to receive new content, updates, and announcements before anyone else."
              />
              <BenefitCard
                icon="📚"
                title="Agent Charter Pack"
                description="VP-agent templates, sub-agent ladders, escalation protocols, and the Cognitive Overhead Index diagnostic tool."
              />
              <BenefitCard
                icon="🎯"
                title="Priority Support"
                description="Direct access to priority support channels and expedited responses to your enquiries."
              />
              <BenefitCard
                icon="💬"
                title="Community Access"
                description="Join an exclusive community of VIP readers, practitioners, and thought leaders."
              />
              <BenefitCard
                icon="🔔"
                title="Launch Updates"
                description="Receive personalised updates about book releases, events, and speaking engagements."
              />
            </div>
          </div>

          {/* Redemption Form */}
          <RedeemForm user={user} />

          {/* Help Section */}
          <div className="text-muted-foreground mt-12 text-center text-sm">
            <p className="mb-2">
              VIP codes are distributed to early supporters, pre-order customers, and special event attendees.
            </p>
            <p>
              If you believe you should have received a code but haven&apos;t, please{' '}
              <a
                href="/contact"
                className="text-brand-cyan hover:underline"
              >
                contact our support team
              </a>.
            </p>
          </div>
        </div>
      </section>
    </Background>
  );
}

/**
 * Benefit Card Component
 * Displays a single VIP benefit with icon, title, and description
 */
interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="bg-brand-obsidian border-brand-cyan/20 hover:border-brand-cyan/40 rounded-2xl border p-6 transition-colors">
      <div className="mb-3 text-4xl" role="img" aria-label={title}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-brand-porcelain">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  );
}
