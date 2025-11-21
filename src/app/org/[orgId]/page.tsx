/**
 * Organization Dashboard Page
 * /org/[orgId]
 *
 * Displays organization overview, members, VIP codes, and LLM-generated plans
 */

import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyOrgMembership } from '@/lib/prisma-rls';
import { getOrgPermissions } from '@/types/organization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrganizationOverview } from '@/components/org/OrganizationOverview';
import { MemberList } from '@/components/org/MemberList';
import { VIPCodeStats } from '@/components/org/VIPCodeStats';
import { PlansList } from '@/components/org/PlansList';
import { OrganizationSettings } from '@/components/org/OrganizationSettings';

interface PageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function OrganizationDashboardPage({ params }: PageProps) {
  const session = await auth();
  const { orgId } = await params;
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/org/${orgId}`);
  }

  // Verify user is a member of this organization
  const membership = await verifyOrgMembership(
    prisma,
    session.user.id,
    orgId
  );

  if (!membership.isMember) {
    notFound();
  }

  // Get organization details
  const org = await prisma.org.findUnique({
    where: { id: orgId },
    include: {
      members: {
        where: { status: 'ACTIVE' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      },
      codes: {
        orderBy: { createdAt: 'desc' },
      },
      plans: {
        where: {
          OR: [
            { privacy: 'PUBLIC' },
            { createdBy: session.user.id },
            {
              privacy: 'SHARED',
              shares: {
                some: {
                  member: {
                    userId: session.user.id,
                  },
                },
              },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              shares: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          codes: true,
          plans: true,
        },
      },
    },
  });

  if (!org) {
    notFound();
  }

  // Get user's membership info
  const userMembership = org.members.find((m) => m.userId === session.user.id);

  if (!userMembership) {
    notFound();
  }

  // Get permissions
  const permissions = getOrgPermissions(userMembership.role);

  // Calculate statistics
  const stats = {
    totalMembers: org._count.members,
    activeMembers: org.members.length,
    totalCodes: org._count.codes,
    activeCodes: org.codes.filter((c) => c.status === 'ACTIVE').length,
    totalCodeRedemptions: org.codes.reduce(
      (sum, code) => sum + code.redemptionCount,
      0
    ),
    totalPlans: org._count.plans,
    publishedPlans: org.plans.filter((p) => p.status === 'PUBLISHED').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{org.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{org.type}</Badge>
              <span className="text-muted-foreground">
                Your role: <strong>{userMembership.role}</strong>
              </span>
            </div>
          </div>
          {permissions.canManageOrg && (
            <Button asChild>
              <a href={`/org/${orgId}/settings`}>Settings</a>
            </Button>
          )}
        </div>

        {/* Domain Verification Status */}
        {org.domain && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Domain: {org.domain}</p>
                  <p className="text-sm text-muted-foreground">
                    {org.domainVerified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-amber-600">Not verified</span>
                    )}
                  </p>
                </div>
                {!org.domainVerified && permissions.canManageOrg && (
                  <Button asChild variant="outline">
                    <a href={`/org/${orgId}/verify-domain`}>
                      Verify Domain
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">
            Members ({stats.activeMembers})
          </TabsTrigger>
          <TabsTrigger value="codes">VIP Codes ({stats.totalCodes})</TabsTrigger>
          <TabsTrigger value="plans">Plans ({stats.totalPlans})</TabsTrigger>
          {permissions.canManageOrg && (
            <TabsTrigger value="settings">Settings</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Suspense fallback={<LoadingCard />}>
            <OrganizationOverview
              org={org}
              stats={stats}
              permissions={permissions}
            />
          </Suspense>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Suspense fallback={<LoadingCard />}>
            <MemberList
              orgId={orgId}
              members={org.members}
              permissions={permissions}
              currentUserId={session.user.id}
            />
          </Suspense>
        </TabsContent>

        {/* VIP Codes Tab */}
        <TabsContent value="codes">
          <Suspense fallback={<LoadingCard />}>
            <VIPCodeStats
              orgId={orgId}
              codes={org.codes}
              permissions={permissions}
            />
          </Suspense>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <Suspense fallback={<LoadingCard />}>
            <PlansList
              orgId={orgId}
              plans={org.plans}
              permissions={permissions}
              userId={session.user.id}
            />
          </Suspense>
        </TabsContent>

        {/* Settings Tab */}
        {permissions.canManageOrg && (
          <TabsContent value="settings">
            <Suspense fallback={<LoadingCard />}>
              <OrganizationSettings
                org={org}
                permissions={permissions}
              />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading...</CardTitle>
        <CardDescription>Please wait</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  const { orgId } = await params;
  const org = await prisma.org.findUnique({
    where: { id: orgId },
    select: { name: true },
  });

  return {
    title: org ? `${org.name} - Organization Dashboard` : 'Organization Dashboard',
    description: 'Manage your organization, members, VIP codes, and AI-generated plans',
  };
}
