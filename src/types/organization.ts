/**
 * Organization Workspace Types
 *
 * Type definitions for organization management, members, and LLM-generated plans
 */

import type {
  Org,
  OrgType,
  OrgMember,
  OrgMemberRole,
  OrgMemberStatus,
  OrgPlan,
  OrgPlanStatus,
  OrgPlanPrivacy,
  OrgPlanShare,
  Code,
  BulkOrder
} from '@prisma/client';

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export interface OrganizationWithRelations extends Org {
  members: OrgMember[];
  codes: Code[];
  bulkOrders: BulkOrder[];
  plans: OrgPlan[];
  _count?: {
    members: number;
    codes: number;
    bulkOrders: number;
    plans: number;
  };
}

export interface OrganizationStats {
  totalMembers: number;
  activeMembers: number;
  totalCodes: number;
  activeCodes: number;
  totalCodeRedemptions: number;
  totalPlans: number;
  publishedPlans: number;
}

export interface CreateOrganizationInput {
  name: string;
  type: OrgType;
  contactEmail?: string;
  contactName?: string;
  domain?: string;
  notes?: string;
  allowAutoJoin?: boolean;
}

export interface UpdateOrganizationInput {
  name?: string;
  type?: OrgType;
  contactEmail?: string;
  contactName?: string;
  domain?: string;
  notes?: string;
  allowAutoJoin?: boolean;
  settings?: Record<string, unknown>;
}

// ============================================================================
// ORGANIZATION MEMBER TYPES
// ============================================================================

export interface OrgMemberWithUser extends OrgMember {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface AddMemberInput {
  userId?: string;
  email?: string;
  role?: OrgMemberRole;
  invitedBy: string;
}

export interface UpdateMemberInput {
  role?: OrgMemberRole;
  status?: OrgMemberStatus;
  metadata?: Record<string, unknown>;
}

export interface MemberInvitation {
  email: string;
  role: OrgMemberRole;
  orgId: string;
  orgName: string;
  invitedBy: string;
  inviterName: string;
  expiresAt: Date;
}

// ============================================================================
// DOMAIN VERIFICATION TYPES
// ============================================================================

export interface DomainVerificationStatus {
  domain: string;
  verified: boolean;
  verifiedAt?: Date;
  verificationToken: string;
  dnsRecordType: 'TXT';
  dnsRecordName: string;
  dnsRecordValue: string;
}

export interface VerifyDomainInput {
  domain: string;
}

export interface VerifyDomainResult {
  success: boolean;
  verified: boolean;
  message: string;
  verifiedAt?: Date;
}

// ============================================================================
// ORGANIZATION PLAN TYPES
// ============================================================================

export interface OrgPlanWithRelations extends OrgPlan {
  org: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  shares?: OrgPlanShareWithMember[];
  _count?: {
    shares: number;
  };
}

export interface OrgPlanShareWithMember extends OrgPlanShare {
  member: {
    id: string;
    userId: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  };
}

export interface GeneratePlanInput {
  orgId: string;
  userId: string;
  title: string;
  description?: string;
  privacy?: OrgPlanPrivacy;

  // Context for LLM
  organizationContext?: {
    industry?: string;
    size?: string;
    challenges?: string[];
    goals?: string[];
  };

  // Custom prompt parameters
  promptParams?: Record<string, unknown>;
}

export interface GeneratePlanResult {
  planId: string;
  status: OrgPlanStatus;
  content: string;
  contentJson?: Record<string, unknown>;
  generationTime: number;
  tokenCount?: number;
}

export interface UpdatePlanInput {
  title?: string;
  description?: string;
  status?: OrgPlanStatus;
  privacy?: OrgPlanPrivacy;
  content?: string;
  contentJson?: Record<string, unknown>;
}

export interface SharePlanInput {
  planId: string;
  memberIds: string[];
  sharedBy: string;
  canEdit?: boolean;
  canDownload?: boolean;
}

export interface PlanAccessCheck {
  hasAccess: boolean;
  canView: boolean;
  canEdit: boolean;
  canDownload: boolean;
  reason?: string;
}

// ============================================================================
// LLM PLAN GENERATION TYPES
// ============================================================================

export interface LLMPromptContext {
  organizationName: string;
  organizationType: OrgType;
  industry?: string;
  size?: string;
  challenges?: string[];
  goals?: string[];
  customContext?: string;
}

export interface LLMGenerationOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface LLMGenerationResponse {
  content: string;
  metadata: {
    model: string;
    tokenCount: number;
    generationTime: number;
    finishReason: string;
  };
}

// ============================================================================
// PDF EXPORT TYPES
// ============================================================================

export interface PdfExportOptions {
  planId: string;
  includeMetadata?: boolean;
  includeTableOfContents?: boolean;
  format?: 'A4' | 'Letter';
}

export interface PdfExportResult {
  url: string;
  fileName: string;
  fileSize: number;
  generatedAt: Date;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateOrgRequest {
  name: string;
  type: OrgType;
  contactEmail?: string;
  contactName?: string;
  domain?: string;
}

export interface CreateOrgResponse {
  success: boolean;
  orgId: string;
  org: Org;
}

export interface GetOrgResponse {
  success: boolean;
  org: OrganizationWithRelations;
  stats: OrganizationStats;
  userMembership?: OrgMember;
}

export interface AddMemberRequest {
  email: string;
  role?: OrgMemberRole;
}

export interface AddMemberResponse {
  success: boolean;
  member: OrgMemberWithUser;
  message: string;
}

export interface RemoveMemberResponse {
  success: boolean;
  message: string;
}

export interface VerifyDomainRequest {
  domain: string;
}

export interface VerifyDomainResponse {
  success: boolean;
  verificationStatus: DomainVerificationStatus;
}

export interface GeneratePlanRequest {
  title: string;
  description?: string;
  privacy?: OrgPlanPrivacy;
  organizationContext?: {
    industry?: string;
    size?: string;
    challenges?: string[];
    goals?: string[];
  };
}

export interface GeneratePlanResponse {
  success: boolean;
  plan: OrgPlanWithRelations;
  generationTime: number;
}

// ============================================================================
// PERMISSIONS & ACCESS CONTROL
// ============================================================================

export interface OrgPermissions {
  canManageOrg: boolean;
  canManageMembers: boolean;
  canCreatePlans: boolean;
  canManagePlans: boolean;
  canInviteMembers: boolean;
  canManageCodes: boolean;
  canViewAnalytics: boolean;
}

export function getOrgPermissions(role: OrgMemberRole): OrgPermissions {
  switch (role) {
    case 'OWNER':
      return {
        canManageOrg: true,
        canManageMembers: true,
        canCreatePlans: true,
        canManagePlans: true,
        canInviteMembers: true,
        canManageCodes: true,
        canViewAnalytics: true,
      };
    case 'ADMIN':
      return {
        canManageOrg: false,
        canManageMembers: true,
        canCreatePlans: true,
        canManagePlans: true,
        canInviteMembers: true,
        canManageCodes: true,
        canViewAnalytics: true,
      };
    case 'MEMBER':
      return {
        canManageOrg: false,
        canManageMembers: false,
        canCreatePlans: true,
        canManagePlans: false,
        canInviteMembers: false,
        canManageCodes: false,
        canViewAnalytics: false,
      };
    case 'VIEWER':
      return {
        canManageOrg: false,
        canManageMembers: false,
        canCreatePlans: false,
        canManagePlans: false,
        canInviteMembers: false,
        canManageCodes: false,
        canViewAnalytics: false,
      };
  }
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  Org,
  OrgType,
  OrgMember,
  OrgMemberRole,
  OrgMemberStatus,
  OrgPlan,
  OrgPlanStatus,
  OrgPlanPrivacy,
  OrgPlanShare,
};
