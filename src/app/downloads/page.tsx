/**
 * Downloads Page
 *
 * Protected page showing all available downloads based on user entitlements:
 * - Free excerpt (if claimed via email)
 * - Agent Charter Pack (if pre-ordered)
 * - Press kit (always available)
 *
 * Features:
 * - Authentication required
 * - Entitlement-based access control
 * - Download tracking and analytics
 * - Clear status indicators
 * - Responsive design
 */

import { Suspense } from 'react';

import Link from 'next/link';

import { Download, FileText, Package, FolderArchive, CheckCircle2, Lock } from 'lucide-react';

import { AuthLoadingState } from '@/components/auth';
import { PressKitDownloadButton } from '@/components/PressKitDownloadButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth, getUserEntitlements } from '@/lib/auth';

import type { Metadata } from 'next';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Downloads | AI-Born',
  description: 'Access your AI-Born digital content including excerpts, bonus packs, and press materials.',
  robots: {
    index: false, // Don't index authenticated pages
    follow: false,
  },
};

// ============================================================================
// Download Item Types
// ============================================================================

interface DownloadItem {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  available: boolean;
  requiresEntitlement?: 'excerpt' | 'agentCharterPack';
  downloadUrl?: string;
  actionLabel: string;
  fileSize?: string;
  fileFormat?: string;
}

// ============================================================================
// Download Actions Component
// ============================================================================

function DownloadAction({
  item,
}: {
  item: DownloadItem;
}) {
  // Press kit - always available, special component
  if (item.id === 'press-kit') {
    return (
      <PressKitDownloadButton
        variant="default"
        size="default"
        label={item.actionLabel}
        className="w-full sm:w-auto"
      />
    );
  }

  // Available downloads
  if (item.available && item.downloadUrl) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <a href={item.downloadUrl} download>
          <Download className="h-4 w-4" />
          {item.actionLabel}
        </a>
      </Button>
    );
  }

  // Locked downloads
  return (
    <Button variant="outline" disabled className="w-full sm:w-auto">
      <Lock className="h-4 w-4" />
      {item.actionLabel}
    </Button>
  );
}

// ============================================================================
// Download Card Component
// ============================================================================

function DownloadCard({
  item,
}: {
  item: DownloadItem;
}) {
  const Icon = item.icon;
  const isLocked = !item.available;

  return (
    <Card className={isLocked ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-lg p-2 ${
                isLocked
                  ? 'bg-muted'
                  : 'bg-brand-cyan/10 text-brand-cyan dark:bg-brand-cyan/20'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                {item.title}
                {item.available && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {item.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* File info */}
          {(item.fileSize || item.fileFormat) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {item.fileFormat && (
                <span className="font-medium">{item.fileFormat}</span>
              )}
              {item.fileSize && <span>{item.fileSize}</span>}
            </div>
          )}

          {/* Download action */}
          <DownloadAction item={item} />

          {/* Locked state message */}
          {isLocked && item.requiresEntitlement === 'excerpt' && (
            <p className="text-sm text-muted-foreground">
              <Link
                href="/#excerpt"
                className="text-brand-cyan hover:text-brand-cyan/80 underline"
              >
                Request the free excerpt
              </Link>{' '}
              to unlock this download.
            </p>
          )}

          {isLocked && item.requiresEntitlement === 'agentCharterPack' && (
            <p className="text-sm text-muted-foreground">
              <Link
                href="/#preorder"
                className="text-brand-cyan hover:text-brand-cyan/80 underline"
              >
                Pre-order AI-Born
              </Link>{' '}
              and{' '}
              <Link
                href="/redeem"
                className="text-brand-cyan hover:text-brand-cyan/80 underline"
              >
                claim your bonus
              </Link>{' '}
              to unlock this pack.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Downloads Content Component (async data loading)
// ============================================================================

async function DownloadsContent() {
  // Require authentication
  const user = await requireAuth('/downloads');

  // Get user entitlements
  const entitlements = await getUserEntitlements(user.id);

  // Define available downloads based on entitlements
  const downloads: DownloadItem[] = [
    {
      id: 'excerpt',
      title: 'Free Excerpt',
      description:
        'Design-polished sample chapter introducing the Five Planes framework and AI-native architecture principles.',
      icon: FileText,
      available: entitlements.hasExcerpt,
      requiresEntitlement: 'excerpt',
      downloadUrl: entitlements.hasExcerpt
        ? '/api/excerpt/download'
        : undefined,
      actionLabel: entitlements.hasExcerpt
        ? 'Download excerpt'
        : 'Claim excerpt',
      fileSize: '2.4 MB',
      fileFormat: 'PDF',
    },
    {
      id: 'agent-charter-pack',
      title: 'Agent Charter Pack',
      description:
        'Complete implementation templates including VP-agent charters, sub-agent ladders, escalation/override protocols, and governance frameworks.',
      icon: Package,
      available: entitlements.hasAgentCharterPack,
      requiresEntitlement: 'agentCharterPack',
      downloadUrl: entitlements.hasAgentCharterPack
        ? '/api/bonus/download/full-bonus-pack'
        : undefined,
      actionLabel: entitlements.hasAgentCharterPack
        ? 'Download charter pack'
        : 'Unlock charter pack',
      fileSize: '8.7 MB',
      fileFormat: 'ZIP',
    },
    {
      id: 'coi-diagnostic',
      title: 'Cognitive Overhead Index (COI) Diagnostic',
      description:
        'Interactive mini-tool to measure institutional drag and identify automation opportunities in your organisation.',
      icon: FileText,
      available: entitlements.hasAgentCharterPack,
      requiresEntitlement: 'agentCharterPack',
      downloadUrl: entitlements.hasAgentCharterPack
        ? '/api/bonus/download/coi-diagnostic'
        : undefined,
      actionLabel: entitlements.hasAgentCharterPack
        ? 'Download COI tool'
        : 'Unlock COI tool',
      fileSize: '1.2 MB',
      fileFormat: 'Google Sheet',
    },
    {
      id: 'press-kit',
      title: 'Press Kit',
      description:
        'Complete media resources including book synopsis, press release, cover art, author headshots, chapter list, and interview topics.',
      icon: FolderArchive,
      available: true, // Always available
      actionLabel: 'Download press kit',
      fileSize: '15.3 MB',
      fileFormat: 'ZIP',
    },
  ];

  // Separate available and locked downloads
  const availableDownloads = downloads.filter((d) => d.available);
  const lockedDownloads = downloads.filter((d) => !d.available);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your downloads
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Access your AI-Born digital content and resources.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Available Downloads */}
          {availableDownloads.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                Available ({availableDownloads.length})
              </h2>
              <div className="grid gap-6 sm:grid-cols-1">
                {availableDownloads.map((item) => (
                  <DownloadCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Locked Downloads */}
          {lockedDownloads.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                Unlock more content ({lockedDownloads.length})
              </h2>
              <div className="grid gap-6 sm:grid-cols-1">
                {lockedDownloads.map((item) => (
                  <DownloadCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Help Section */}
          <Card className="border-brand-cyan/20 bg-brand-cyan/5">
            <CardHeader>
              <CardTitle className="text-lg">Need help?</CardTitle>
              <CardDescription>
                Having trouble accessing your downloads?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If you've pre-ordered the book but don't see the Agent Charter
                Pack, make sure you've{' '}
                <Link
                  href="/redeem"
                  className="text-brand-cyan hover:text-brand-cyan/80 underline font-medium"
                >
                  claimed your bonus
                </Link>{' '}
                by uploading your receipt.
              </p>
              <p className="text-sm text-muted-foreground">
                For other issues, please{' '}
                <Link
                  href="/media-kit#contact"
                  className="text-brand-cyan hover:text-brand-cyan/80 underline font-medium"
                >
                  contact support
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Page Component (with Suspense)
// ============================================================================

export default function DownloadsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          {/* Header Skeleton */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <AuthLoadingState
                  variant="page"
                  message="Loading your downloads..."
                  showSpinner
                />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <DownloadsContent />
    </Suspense>
  );
}
