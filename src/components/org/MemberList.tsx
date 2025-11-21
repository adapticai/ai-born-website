/**
 * Member List Component
 * Displays and manages organization members
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, MoreVertical, Shield, User, Eye } from 'lucide-react';
import type { OrgMemberWithUser, OrgPermissions } from '@/types/organization';

interface MemberListProps {
  orgId: string;
  members: OrgMemberWithUser[];
  permissions: OrgPermissions;
  currentUserId: string;
}

export function MemberList({
  orgId,
  members,
  permissions,
  currentUserId,
}: MemberListProps) {
  const [isAddingMember, setIsAddingMember] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Shield className="h-4 w-4" />;
      case 'ADMIN':
        return <User className="h-4 w-4" />;
      case 'VIEWER':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'ADMIN':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Manage organization members and their roles
            </CardDescription>
          </div>
          {permissions.canInviteMembers && (
            <Button onClick={() => setIsAddingMember(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {member.user.name?.[0]?.toUpperCase() ||
                      member.user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.user.name || member.user.email}
                    {member.userId === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                  {member.joinedAt && (
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  <span className="mr-1">{getRoleIcon(member.role)}</span>
                  {member.role}
                </Badge>
                {permissions.canManageMembers &&
                  member.userId !== currentUserId && (
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No members found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
