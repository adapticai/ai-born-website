/**
 * Plans List Component
 * Displays and manages LLM-generated plans
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Download, Share2, MoreVertical } from 'lucide-react';
import type { OrgPlan } from '@prisma/client';
import type { OrgPermissions } from '@/types/organization';

interface PlansListProps {
  orgId: string;
  plans: (OrgPlan & { _count?: { shares: number } })[];
  permissions: OrgPermissions;
  userId: string;
}

export function PlansList({ orgId, plans, permissions, userId }: PlansListProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'default';
      case 'READY':
        return 'secondary';
      case 'GENERATING':
        return 'outline';
      case 'DRAFT':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPrivacyBadgeVariant = (privacy: string) => {
    switch (privacy) {
      case 'PUBLIC':
        return 'default';
      case 'SHARED':
        return 'secondary';
      case 'PRIVATE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI-Generated Plans</CardTitle>
              <CardDescription>
                Custom organizational transformation plans powered by Claude AI
              </CardDescription>
            </div>
            {permissions.canCreatePlans && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Plan
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {plan.title}
                  </CardTitle>
                  {plan.description && (
                    <CardDescription className="line-clamp-2">
                      {plan.description}
                    </CardDescription>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusBadgeVariant(plan.status)}>
                  {plan.status}
                </Badge>
                <Badge variant={getPrivacyBadgeVariant(plan.privacy)}>
                  {plan.privacy}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Created {new Date(plan.createdAt).toLocaleDateString()}
                </p>
                {plan.model && (
                  <p className="text-xs">Model: {plan.model}</p>
                )}
                {plan.generationTime && (
                  <p className="text-xs">
                    Generated in {(plan.generationTime / 1000).toFixed(1)}s
                  </p>
                )}
                {plan._count && plan._count.shares > 0 && (
                  <p className="text-xs">
                    Shared with {plan._count.shares} member
                    {plan._count.shares !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {plan.viewCount}
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {plan.downloadCount}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-3 w-3" />
                  View
                </Button>
                {plan.privacy !== 'PRIVATE' && (
                  <Button variant="outline" size="sm">
                    <Share2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No plans generated yet
            </p>
            {permissions.canCreatePlans && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Your First Plan
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
