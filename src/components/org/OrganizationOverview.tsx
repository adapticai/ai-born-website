/**
 * Organization Overview Component
 * Displays key statistics and quick actions
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Code, FileText, TrendingUp } from 'lucide-react';
import type { Org } from '@prisma/client';
import type { OrganizationStats, OrgPermissions } from '@/types/organization';

interface OrganizationOverviewProps {
  org: Org;
  stats: OrganizationStats;
  permissions: OrgPermissions;
}

export function OrganizationOverview({
  org,
  stats,
  permissions,
}: OrganizationOverviewProps) {
  const statCards = [
    {
      title: 'Members',
      value: stats.activeMembers,
      description: `${stats.totalMembers} total`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'VIP Codes',
      value: stats.activeCodes,
      description: `${stats.totalCodeRedemptions} redemptions`,
      icon: Code,
      color: 'text-purple-600',
    },
    {
      title: 'Plans',
      value: stats.publishedPlans,
      description: `${stats.totalPlans} total`,
      icon: FileText,
      color: 'text-green-600',
    },
    {
      title: 'Code Usage',
      value: stats.totalCodeRedemptions > 0
        ? `${Math.round((stats.totalCodeRedemptions / (stats.totalCodes || 1)) * 100)}%`
        : '0%',
      description: 'Average redemption rate',
      icon: TrendingUp,
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {permissions.canInviteMembers && (
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Invite Members
              </Button>
            )}
            {permissions.canManageCodes && (
              <Button variant="outline" className="w-full">
                <Code className="mr-2 h-4 w-4" />
                Generate VIP Code
              </Button>
            )}
            {permissions.canCreatePlans && (
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="text-sm font-semibold">{org.type}</p>
            </div>
            {org.domain && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Domain</p>
                <p className="text-sm font-semibold">{org.domain}</p>
              </div>
            )}
            {org.contactEmail && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contact Email
                </p>
                <p className="text-sm font-semibold">{org.contactEmail}</p>
              </div>
            )}
            {org.contactName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contact Name
                </p>
                <p className="text-sm font-semibold">{org.contactName}</p>
              </div>
            )}
          </div>
          {org.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Notes
              </p>
              <p className="text-sm">{org.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
