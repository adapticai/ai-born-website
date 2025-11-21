/**
 * Organization Settings Component
 * Manage organization configuration and preferences
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Org } from '@prisma/client';
import type { OrgPermissions } from '@/types/organization';

interface OrganizationSettingsProps {
  org: Org;
  permissions: OrgPermissions;
}

export function OrganizationSettings({
  org,
  permissions,
}: OrganizationSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update your organization's basic details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              defaultValue={org.name}
              disabled={!permissions.canManageOrg}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Organization Type</Label>
            <Input
              id="type"
              defaultValue={org.type}
              disabled={!permissions.canManageOrg}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              defaultValue={org.contactEmail ?? ''}
              disabled={!permissions.canManageOrg}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              defaultValue={org.contactName ?? ''}
              disabled={!permissions.canManageOrg}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              defaultValue={org.notes ?? ''}
              disabled={!permissions.canManageOrg}
              rows={3}
            />
          </div>

          {permissions.canManageOrg && (
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Verification</CardTitle>
          <CardDescription>
            Verify your domain to enable automatic member enrollment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              defaultValue={org.domain ?? ''}
              placeholder="example.com"
              disabled={!permissions.canManageOrg}
            />
          </div>

          {org.domain && (
            <div className="flex items-center gap-2">
              {org.domainVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    Domain verified
                  </span>
                  {org.domainVerifiedAt && (
                    <span className="text-sm text-muted-foreground">
                      on {new Date(org.domainVerifiedAt).toLocaleDateString()}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm text-amber-600 font-medium">
                    Domain not verified
                  </span>
                  {permissions.canManageOrg && (
                    <Button variant="outline" size="sm">
                      Verify Now
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoJoin">Auto-join Members</Label>
              <p className="text-sm text-muted-foreground">
                Automatically add users with matching email domain
              </p>
            </div>
            <Switch
              id="autoJoin"
              checked={org.allowAutoJoin}
              disabled={
                !permissions.canManageOrg || !org.domainVerified
              }
            />
          </div>

          {permissions.canManageOrg && (
            <div className="flex justify-end">
              <Button>Save Domain Settings</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {permissions.canManageOrg && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Organization</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this organization and all associated data
                </p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
