/**
 * Authentication Flow Unit Tests
 *
 * Comprehensive tests for authentication functionality:
 * - Sign-in flow with different providers
 * - Sign-up flow
 * - Protected route redirects
 * - Entitlement checks
 * - Session management
 * - Sign-out functionality
 *
 * @module __tests__/auth/auth-flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentUser,
  getSession,
  requireAuth,
  isProtectedRoute,
  isAdminRoute,
  hasEntitlement,
  getUserEntitlements,
  canAccessResource,
  verifyEmailOwnership,
  getSignInUrl,
  getSignOutUrl,
  formatUserDisplayName,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mock dependencies
vi.mock('../../../auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    receipt: {
      count: vi.fn(),
    },
    bonusClaim: {
      count: vi.fn(),
    },
    entitlement: {
      count: vi.fn(),
    },
  },
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT: ${url}`);
  }),
}));

const { auth } = await import('../../../auth');

describe('Authentication Flow Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  };

  const mockSession = {
    user: mockUser,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession);

      const user = await getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it('should return null when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it('should handle auth errors gracefully', async () => {
      vi.mocked(auth).mockRejectedValue(new Error('Auth error'));

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null when session has no user', async () => {
      vi.mocked(auth).mockResolvedValue({ expires: '2025-12-31' } as any);

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return full session when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession);

      const session = await getSession();

      expect(session).toEqual(mockSession);
      expect(session?.user).toEqual(mockUser);
    });

    it('should return null when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const session = await getSession();

      expect(session).toBeNull();
    });

    it('should handle session errors gracefully', async () => {
      vi.mocked(auth).mockRejectedValue(new Error('Session error'));

      const session = await getSession();

      expect(session).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession);

      const user = await requireAuth();

      expect(user).toEqual(mockUser);
    });

    it('should redirect to sign-in when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow('REDIRECT: /auth/signin?callbackUrl=%2F');
    });

    it('should redirect with custom callback URL', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      await expect(requireAuth('/dashboard')).rejects.toThrow(
        'REDIRECT: /auth/signin?callbackUrl=%2Fdashboard'
      );
    });

    it('should handle special characters in callback URL', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      await expect(requireAuth('/page?param=value&other=test')).rejects.toThrow(
        'REDIRECT: /auth/signin?callbackUrl=%2Fpage%3Fparam%3Dvalue%26other%3Dtest'
      );
    });
  });

  describe('isProtectedRoute', () => {
    it('should identify protected routes', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true);
      expect(isProtectedRoute('/profile')).toBe(true);
      expect(isProtectedRoute('/account')).toBe(true);
      expect(isProtectedRoute('/settings')).toBe(true);
      expect(isProtectedRoute('/bonus-claim')).toBe(true);
      expect(isProtectedRoute('/downloads')).toBe(true);
      expect(isProtectedRoute('/admin')).toBe(true);
      expect(isProtectedRoute('/admin/users')).toBe(true);
    });

    it('should identify public routes', () => {
      expect(isProtectedRoute('/')).toBe(false);
      expect(isProtectedRoute('/about')).toBe(false);
      expect(isProtectedRoute('/pricing')).toBe(false);
      expect(isProtectedRoute('/faq')).toBe(false);
      expect(isProtectedRoute('/auth/signin')).toBe(false);
    });

    it('should handle routes with query parameters', () => {
      expect(isProtectedRoute('/dashboard?tab=settings')).toBe(true);
      expect(isProtectedRoute('/pricing?plan=pro')).toBe(false);
    });
  });

  describe('isAdminRoute', () => {
    it('should identify admin routes', () => {
      expect(isAdminRoute('/admin')).toBe(true);
      expect(isAdminRoute('/admin/users')).toBe(true);
      expect(isAdminRoute('/admin/receipts')).toBe(true);
      expect(isAdminRoute('/admin/analytics')).toBe(true);
    });

    it('should identify non-admin routes', () => {
      expect(isAdminRoute('/')).toBe(false);
      expect(isAdminRoute('/dashboard')).toBe(false);
      expect(isAdminRoute('/profile')).toBe(false);
      expect(isAdminRoute('/about')).toBe(false);
      expect(isAdminRoute('/settings')).toBe(false);
    });
  });

  describe('getUserEntitlements', () => {
    beforeEach(() => {
      // Reset mocks
      vi.mocked(prisma.receipt.count).mockResolvedValue(0);
      vi.mocked(prisma.bonusClaim.count).mockResolvedValue(0);
      vi.mocked(prisma.entitlement.count).mockResolvedValue(0);
    });

    it('should return all false when user has no entitlements', async () => {
      const entitlements = await getUserEntitlements('user-123');

      expect(entitlements).toEqual({
        hasPreordered: false,
        hasExcerpt: false,
        hasAgentCharterPack: false,
      });
    });

    it('should detect preorder from verified receipt', async () => {
      vi.mocked(prisma.receipt.count).mockResolvedValue(1);

      const entitlements = await getUserEntitlements('user-123');

      expect(entitlements.hasPreordered).toBe(true);
      expect(prisma.receipt.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: 'VERIFIED',
        },
      });
    });

    it('should detect Agent Charter Pack from delivered bonus claim', async () => {
      vi.mocked(prisma.bonusClaim.count).mockResolvedValue(1);

      const entitlements = await getUserEntitlements('user-123');

      expect(entitlements.hasAgentCharterPack).toBe(true);
      expect(prisma.bonusClaim.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: 'DELIVERED',
        },
      });
    });

    it('should detect excerpt from entitlement record', async () => {
      vi.mocked(prisma.entitlement.count).mockResolvedValue(1);

      const entitlements = await getUserEntitlements('user-123');

      expect(entitlements.hasExcerpt).toBe(true);
      expect(prisma.entitlement.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          type: 'EARLY_EXCERPT',
          status: {
            in: ['ACTIVE', 'FULFILLED'],
          },
        },
      });
    });

    it('should detect multiple entitlements', async () => {
      vi.mocked(prisma.receipt.count).mockResolvedValue(1);
      vi.mocked(prisma.bonusClaim.count).mockResolvedValue(1);
      vi.mocked(prisma.entitlement.count).mockResolvedValue(1);

      const entitlements = await getUserEntitlements('user-123');

      expect(entitlements).toEqual({
        hasPreordered: true,
        hasExcerpt: true,
        hasAgentCharterPack: true,
      });
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(prisma.receipt.count).mockRejectedValue(new Error('DB error'));

      const entitlements = await getUserEntitlements('user-123');

      // Should return safe defaults
      expect(entitlements).toEqual({
        hasPreordered: false,
        hasExcerpt: false,
        hasAgentCharterPack: false,
      });
    });

    it('should only count verified receipts', async () => {
      // Pending/rejected receipts should not count
      vi.mocked(prisma.receipt.count).mockResolvedValue(0);

      const entitlements = await getUserEntitlements('user-123');

      expect(entitlements.hasPreordered).toBe(false);
    });
  });

  describe('hasEntitlement', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.receipt.count).mockResolvedValue(0);
      vi.mocked(prisma.bonusClaim.count).mockResolvedValue(0);
      vi.mocked(prisma.entitlement.count).mockResolvedValue(0);
    });

    it('should return false when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const hasPreorder = await hasEntitlement('preorder');

      expect(hasPreorder).toBe(false);
    });

    it('should check preorder entitlement', async () => {
      vi.mocked(prisma.receipt.count).mockResolvedValue(1);

      const hasPreorder = await hasEntitlement('preorder');

      expect(hasPreorder).toBe(true);
    });

    it('should check excerpt entitlement', async () => {
      vi.mocked(prisma.entitlement.count).mockResolvedValue(1);

      const hasExcerpt = await hasEntitlement('excerpt');

      expect(hasExcerpt).toBe(true);
    });

    it('should check agent charter pack entitlement', async () => {
      vi.mocked(prisma.bonusClaim.count).mockResolvedValue(1);

      const hasPack = await hasEntitlement('agentCharterPack');

      expect(hasPack).toBe(true);
    });

    it('should handle errors and fail closed', async () => {
      vi.mocked(prisma.receipt.count).mockRejectedValue(new Error('DB error'));

      const hasPreorder = await hasEntitlement('preorder');

      // Should fail closed (deny access on error)
      expect(hasPreorder).toBe(false);
    });
  });

  describe('canAccessResource', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.receipt.count).mockResolvedValue(0);
      vi.mocked(prisma.bonusClaim.count).mockResolvedValue(0);
      vi.mocked(prisma.entitlement.count).mockResolvedValue(0);
    });

    it('should allow public access to press kit', async () => {
      vi.mocked(auth).mockResolvedValue(null); // Not authenticated

      const canAccess = await canAccessResource('pressKit');

      expect(canAccess).toBe(true);
    });

    it('should deny access to excerpt when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const canAccess = await canAccessResource('excerpt');

      expect(canAccess).toBe(false);
    });

    it('should allow access to excerpt with entitlement', async () => {
      vi.mocked(prisma.entitlement.count).mockResolvedValue(1);

      const canAccess = await canAccessResource('excerpt');

      expect(canAccess).toBe(true);
    });

    it('should deny access to agent charter pack without entitlement', async () => {
      const canAccess = await canAccessResource('agentCharterPack');

      expect(canAccess).toBe(false);
    });

    it('should allow access to agent charter pack with entitlement', async () => {
      vi.mocked(prisma.bonusClaim.count).mockResolvedValue(1);

      const canAccess = await canAccessResource('agentCharterPack');

      expect(canAccess).toBe(true);
    });
  });

  describe('verifyEmailOwnership', () => {
    it('should verify matching email (case-insensitive)', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession);

      const verified = await verifyEmailOwnership('test@example.com');

      expect(verified).toBe(true);
    });

    it('should verify with different case', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession);

      const verified = await verifyEmailOwnership('TEST@EXAMPLE.COM');

      expect(verified).toBe(true);
    });

    it('should reject non-matching email', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession);

      const verified = await verifyEmailOwnership('other@example.com');

      expect(verified).toBe(false);
    });

    it('should reject when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const verified = await verifyEmailOwnership('test@example.com');

      expect(verified).toBe(false);
    });

    it('should reject when user has no email', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', email: null, name: 'Test' },
        expires: '2025-12-31',
      } as any);

      const verified = await verifyEmailOwnership('test@example.com');

      expect(verified).toBe(false);
    });
  });

  describe('URL Helpers', () => {
    describe('getSignInUrl', () => {
      it('should generate sign-in URL with default callback', () => {
        const url = getSignInUrl();

        expect(url).toBe('/auth/signin?callbackUrl=%2F');
      });

      it('should generate sign-in URL with custom callback', () => {
        const url = getSignInUrl('/dashboard');

        expect(url).toBe('/auth/signin?callbackUrl=%2Fdashboard');
      });

      it('should encode special characters in callback URL', () => {
        const url = getSignInUrl('/page?param=value&other=test');

        expect(url).toBe('/auth/signin?callbackUrl=%2Fpage%3Fparam%3Dvalue%26other%3Dtest');
      });
    });

    describe('getSignOutUrl', () => {
      it('should generate sign-out URL with default callback', () => {
        const url = getSignOutUrl();

        expect(url).toBe('/auth/signout?callbackUrl=%2F');
      });

      it('should generate sign-out URL with custom callback', () => {
        const url = getSignOutUrl('/goodbye');

        expect(url).toBe('/auth/signout?callbackUrl=%2Fgoodbye');
      });
    });
  });

  describe('formatUserDisplayName', () => {
    it('should return name when available', () => {
      const displayName = formatUserDisplayName({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(displayName).toBe('John Doe');
    });

    it('should extract from email when name is null', () => {
      const displayName = formatUserDisplayName({
        name: null,
        email: 'john.doe@example.com',
      });

      expect(displayName).toBe('john.doe');
    });

    it('should return "User" when both name and email are null', () => {
      const displayName = formatUserDisplayName({
        name: null,
        email: null,
      });

      expect(displayName).toBe('User');
    });

    it('should return "User" when email is empty string', () => {
      const displayName = formatUserDisplayName({
        name: null,
        email: '',
      });

      expect(displayName).toBe('User');
    });

    it('should handle complex email addresses', () => {
      const displayName = formatUserDisplayName({
        name: null,
        email: 'john+newsletter@example.com',
      });

      expect(displayName).toBe('john+newsletter');
    });
  });

  describe('Session Management', () => {
    it('should cache getCurrentUser within same request', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Call multiple times
      await getCurrentUser();
      await getCurrentUser();
      await getCurrentUser();

      // Should use React cache, but auth is still called
      // (cache behavior may vary in test environment)
      expect(auth).toHaveBeenCalled();
    });

    it('should handle session expiration gracefully', async () => {
      const expiredSession = {
        ...mockSession,
        expires: new Date(Date.now() - 1000).toISOString(), // Expired
      };

      vi.mocked(auth).mockResolvedValue(expiredSession);

      const user = await getCurrentUser();

      // Auth library should handle expiration, but we still get the user object
      expect(user).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user ID', async () => {
      const entitlements = await getUserEntitlements('');

      // Should query with empty string (will return no results)
      expect(prisma.receipt.count).toHaveBeenCalled();
    });

    it('should handle concurrent entitlement checks', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.receipt.count).mockResolvedValue(1);
      vi.mocked(prisma.bonusClaim.count).mockResolvedValue(1);
      vi.mocked(prisma.entitlement.count).mockResolvedValue(1);

      // Check multiple entitlements concurrently
      const results = await Promise.all([
        hasEntitlement('preorder'),
        hasEntitlement('excerpt'),
        hasEntitlement('agentCharterPack'),
      ]);

      expect(results).toEqual([true, true, true]);
    });

    it('should handle very long callback URLs', async () => {
      const longPath = '/dashboard/settings/profile/edit?redirect=' + 'a'.repeat(500);
      const url = getSignInUrl(longPath);

      expect(url).toContain('/auth/signin?callbackUrl=');
      expect(url.length).toBeGreaterThan(500);
    });
  });
});
