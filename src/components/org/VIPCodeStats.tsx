/**
 * VIP Code Statistics Component
 * Displays VIP code usage and management
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Code } from '@prisma/client';
import type { OrgPermissions } from '@/types/organization';

interface VIPCodeStatsProps {
  orgId: string;
  codes: Code[];
  permissions: OrgPermissions;
}

export function VIPCodeStats({ orgId, codes, permissions }: VIPCodeStatsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'REDEEMED':
        return 'secondary';
      case 'EXPIRED':
        return 'outline';
      case 'REVOKED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'VIP_PREVIEW':
        return 'default';
      case 'VIP_BONUS':
        return 'secondary';
      case 'PARTNER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{codes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {codes.filter((c) => c.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {codes.reduce((sum, code) => sum + code.redemptionCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Codes List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>VIP Codes</CardTitle>
              <CardDescription>
                Manage and track VIP code usage
              </CardDescription>
            </div>
            {permissions.canManageCodes && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Code
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="font-mono font-semibold text-lg">
                      {code.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      {copiedCode === code.code ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getTypeBadgeVariant(code.type)}>
                      {code.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(code.status)}>
                      {code.status}
                    </Badge>
                    {code.description && (
                      <span className="text-sm text-muted-foreground">
                        {code.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {code.redemptionCount}{' '}
                    {code.maxRedemptions
                      ? `/ ${code.maxRedemptions}`
                      : ''}{' '}
                    redeemed
                  </p>
                  {code.validUntil && (
                    <p className="text-xs text-muted-foreground">
                      Expires{' '}
                      {new Date(code.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {codes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No VIP codes found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
