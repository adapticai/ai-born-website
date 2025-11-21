/**
 * Admin Authentication Unit Tests
 *
 * Comprehensive tests for admin authentication functionality:
 * - Admin route protection
 * - Non-admin access denial
 * - Admin-only API endpoint security
 * - Rate limiting
 * - Audit logging
 * - Admin user type guards
 *
 * @module __tests__/auth/admin-auth
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAdminEmails,
  isAdminEmail,
  isAdmin,
  requireAdmin,
  getAdminUsers,
  isRateLimited,
  cleanupRateLimitStore,
  logAdminAction,
  getClientIp,
  checkAdminAuth,
  isAdminUser,
} from '@/lib/admin-auth';
import type { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('../../../auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT: ${url}`);
  }),
}));

const { auth } = await import('../../../auth');

describe('Admin Authentication Tests', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('getAdminEmails', () => {
    it('should parse comma-separated admin emails', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com,support@example.com';

      const emails = getAdminEmails();

      expect(emails).toEqual(['admin@example.com', 'support@example.com']);
    });

    it('should normalize emails to lowercase', () => {
      process.env.ADMIN_EMAILS = 'Admin@Example.COM,SUPPORT@EXAMPLE.COM';

      const emails = getAdminEmails();

      expect(emails).toEqual(['admin@example.com', 'support@example.com']);
    });

    it('should trim whitespace', () => {
      process.env.ADMIN_EMAILS = ' admin@example.com , support@example.com ';

      const emails = getAdminEmails();

      expect(emails).toEqual(['admin@example.com', 'support@example.com']);
    });

    it('should filter out empty strings', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com,,support@example.com,';

      const emails = getAdminEmails();

      expect(emails).toEqual(['admin@example.com', 'support@example.com']);
    });

    it('should return empty array when no admin emails configured', () => {
      process.env.ADMIN_EMAILS = '';

      const emails = getAdminEmails();

      expect(emails).toEqual([]);
    });

    it('should return empty array when ADMIN_EMAILS is undefined', () => {
      delete process.env.ADMIN_EMAILS;

      const emails = getAdminEmails();

      expect(emails).toEqual([]);
    });

    it('should handle single admin email', () => {
      process.env.ADMIN_EMAILS = 'solo@example.com';

      const emails = getAdminEmails();

      expect(emails).toEqual(['solo@example.com']);
    });
  });

  describe('isAdminEmail', () => {
    beforeEach(() => {
      process.env.ADMIN_EMAILS = 'admin@example.com,support@example.com';
    });

    it('should return true for admin email', () => {
      expect(isAdminEmail('admin@example.com')).toBe(true);
      expect(isAdminEmail('support@example.com')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isAdminEmail('ADMIN@EXAMPLE.COM')).toBe(true);
      expect(isAdminEmail('Admin@Example.Com')).toBe(true);
    });

    it('should return false for non-admin email', () => {
      expect(isAdminEmail('user@example.com')).toBe(false);
      expect(isAdminEmail('admin@other.com')).toBe(false);
    });

    it('should return false for null email', () => {
      expect(isAdminEmail(null)).toBe(false);
    });

    it('should return false for undefined email', () => {
      expect(isAdminEmail(undefined)).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(isAdminEmail(' admin@example.com ')).toBe(true);
    });

    it('should return false when no admins configured', () => {
      process.env.ADMIN_EMAILS = '';

      expect(isAdminEmail('admin@example.com')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    beforeEach(() => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
    });

    it('should return true for admin user', async () => {
      const adminUser = { email: 'admin@example.com' };

      const result = await isAdmin(adminUser);

      expect(result).toBe(true);
    });

    it('should return false for non-admin user', async () => {
      const regularUser = { email: 'user@example.com' };

      const result = await isAdmin(regularUser);

      expect(result).toBe(false);
    });

    it('should fetch session when no user provided', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', email: 'admin@example.com', name: 'Admin' },
        expires: '2025-12-31',
      });

      const result = await isAdmin();

      expect(result).toBe(true);
      expect(auth).toHaveBeenCalled();
    });

    it('should return false when session has no user', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await isAdmin();

      expect(result).toBe(false);
    });

    it('should return false when user has no email', async () => {
      const userWithoutEmail = { id: '123', name: 'Test' };

      const result = await isAdmin(userWithoutEmail as any);

      expect(result).toBe(false);
    });

    it('should handle auth errors gracefully', async () => {
      vi.mocked(auth).mockRejectedValue(new Error('Auth error'));

      const result = await isAdmin();

      expect(result).toBe(false);
    });
  });

  describe('requireAdmin', () => {
    beforeEach(() => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
    });

    it('should return user when admin is authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', email: 'admin@example.com', name: 'Admin' },
        expires: '2025-12-31',
      });

      const user = await requireAdmin();

      expect(user).toEqual({ id: '123', email: 'admin@example.com', name: 'Admin' });
    });

    it('should redirect to signin when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow('REDIRECT: /auth/signin?callbackUrl=%2F');
    });

    it('should redirect to unauthorized when not admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', email: 'user@example.com', name: 'User' },
        expires: '2025-12-31',
      });

      await expect(requireAdmin()).rejects.toThrow('REDIRECT: /unauthorized');
    });

    it('should use custom redirect URL', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      await expect(requireAdmin('/admin/dashboard')).rejects.toThrow(
        'REDIRECT: /auth/signin?callbackUrl=%2Fadmin%2Fdashboard'
      );
    });

    it('should redirect when user has no email', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', name: 'User' },
        expires: '2025-12-31',
      } as any);

      await expect(requireAdmin()).rejects.toThrow('REDIRECT: /auth/signin');
    });
  });

  describe('getAdminUsers', () => {
    it('should return list of admin emails', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com,support@example.com';

      const admins = getAdminUsers();

      expect(admins).toEqual(['admin@example.com', 'support@example.com']);
    });

    it('should return empty array when no admins configured', () => {
      process.env.ADMIN_EMAILS = '';

      const admins = getAdminUsers();

      expect(admins).toEqual([]);
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear rate limit store before each test
      cleanupRateLimitStore();
    });

    it('should allow first request', () => {
      const limited = isRateLimited('user-123', 10, 60000);

      expect(limited).toBe(false);
    });

    it('should allow requests under limit', () => {
      // Make 5 requests (limit is 10)
      for (let i = 0; i < 5; i++) {
        const limited = isRateLimited('user-123', 10, 60000);
        expect(limited).toBe(false);
      }
    });

    it('should block requests over limit', () => {
      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        isRateLimited('user-123', 10, 60000);
      }

      // 11th request should be blocked
      const limited = isRateLimited('user-123', 10, 60000);

      expect(limited).toBe(true);
    });

    it('should reset after time window', () => {
      // Mock timer
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        isRateLimited('user-123', 10, 60000);
      }

      // Verify blocked
      expect(isRateLimited('user-123', 10, 60000)).toBe(true);

      // Advance time past window
      vi.spyOn(Date, 'now').mockReturnValue(now + 61000);

      // Should be allowed again
      const limited = isRateLimited('user-123', 10, 60000);

      expect(limited).toBe(false);
    });

    it('should track different identifiers separately', () => {
      // User 1 makes 10 requests
      for (let i = 0; i < 10; i++) {
        isRateLimited('user-1', 10, 60000);
      }

      // User 1 should be blocked
      expect(isRateLimited('user-1', 10, 60000)).toBe(true);

      // User 2 should be allowed
      expect(isRateLimited('user-2', 10, 60000)).toBe(false);
    });

    it('should use default limits when not specified', () => {
      // Default is 100 requests per minute
      for (let i = 0; i < 100; i++) {
        isRateLimited('user-123');
      }

      const limited = isRateLimited('user-123');

      expect(limited).toBe(true);
    });
  });

  describe('logAdminAction', () => {
    let consoleLogSpy: any;

    beforeEach(() => {
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log admin action to console', () => {
      const auditEntry = {
        timestamp: new Date(),
        adminId: 'admin@example.com',
        action: 'DELETE',
        resource: 'receipt',
        resourceId: 'receipt-123',
        details: { reason: 'fraudulent' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      logAdminAction(auditEntry);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_AUDIT]',
        expect.stringContaining('"adminId":"admin@example.com"')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_AUDIT]',
        expect.stringContaining('"action":"DELETE"')
      );
    });

    it('should handle optional fields', () => {
      const minimalEntry = {
        timestamp: new Date(),
        adminId: 'admin@example.com',
        action: 'VIEW',
        resource: 'dashboard',
      };

      logAdminAction(minimalEntry);

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
            return null;
          },
        },
      } as unknown as NextRequest;

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-real-ip') return '192.168.1.1';
            return null;
          },
        },
      } as unknown as NextRequest;

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.1');
    });

    it('should prioritize x-forwarded-for over x-real-ip', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1';
            if (name === 'x-real-ip') return '10.0.0.1';
            return null;
          },
        },
      } as unknown as NextRequest;

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.1');
    });

    it('should return undefined when no IP headers present', () => {
      const request = {
        headers: {
          get: () => null,
        },
      } as unknown as NextRequest;

      const ip = getClientIp(request);

      expect(ip).toBeUndefined();
    });

    it('should handle multiple IPs in x-forwarded-for', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1, 172.16.0.1';
            return null;
          },
        },
      } as unknown as NextRequest;

      const ip = getClientIp(request);

      // Should return first IP (client IP)
      expect(ip).toBe('192.168.1.1');
    });
  });

  describe('checkAdminAuth', () => {
    beforeEach(() => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      cleanupRateLimitStore();
    });

    it('should authorize valid admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', email: 'admin@example.com', name: 'Admin' },
        expires: '2025-12-31',
      });

      const request = {
        headers: { get: () => null },
      } as unknown as NextRequest;

      const result = await checkAdminAuth(request);

      expect(result.authorized).toBe(true);
      expect(result.adminId).toBe('admin@example.com');
      expect(result.error).toBeUndefined();
    });

    it('should reject when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = {
        headers: { get: () => null },
      } as unknown as NextRequest;

      const result = await checkAdminAuth(request);

      expect(result.authorized).toBe(false);
      expect(result.error).toBe('Unauthorized: No valid session');
    });

    it('should reject when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', email: 'user@example.com', name: 'User' },
        expires: '2025-12-31',
      });

      const request = {
        headers: { get: () => null },
      } as unknown as NextRequest;

      const result = await checkAdminAuth(request);

      expect(result.authorized).toBe(false);
      expect(result.error).toBe('Forbidden: Admin access required');
    });

    it('should reject when rate limited', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', email: 'admin@example.com', name: 'Admin' },
        expires: '2025-12-31',
      });

      const request = {
        headers: { get: () => null },
      } as unknown as NextRequest;

      // Make requests up to limit
      for (let i = 0; i < 100; i++) {
        await checkAdminAuth(request);
      }

      // Next request should be rate limited
      const result = await checkAdminAuth(request);

      expect(result.authorized).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
      expect(result.rateLimited).toBe(true);
    });

    it('should handle auth errors', async () => {
      vi.mocked(auth).mockRejectedValue(new Error('Auth failed'));

      const request = {
        headers: { get: () => null },
      } as unknown as NextRequest;

      const result = await checkAdminAuth(request);

      expect(result.authorized).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });

  describe('isAdminUser type guard', () => {
    beforeEach(() => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
    });

    it('should return true for valid admin user object', () => {
      const user = {
        id: '123',
        email: 'admin@example.com',
        name: 'Admin User',
      };

      expect(isAdminUser(user)).toBe(true);
    });

    it('should return false for non-admin user', () => {
      const user = {
        id: '123',
        email: 'user@example.com',
        name: 'Regular User',
      };

      expect(isAdminUser(user)).toBe(false);
    });

    it('should return false for invalid objects', () => {
      expect(isAdminUser(null)).toBe(false);
      expect(isAdminUser(undefined)).toBe(false);
      expect(isAdminUser('string')).toBe(false);
      expect(isAdminUser(123)).toBe(false);
      expect(isAdminUser({})).toBe(false);
    });

    it('should return false for object without email', () => {
      const user = {
        id: '123',
        name: 'User',
      };

      expect(isAdminUser(user)).toBe(false);
    });

    it('should return false for object with non-string email', () => {
      const user = {
        id: '123',
        email: 123,
        name: 'User',
      };

      expect(isAdminUser(user)).toBe(false);
    });

    it('should work with optional fields', () => {
      const user = {
        email: 'admin@example.com',
      };

      expect(isAdminUser(user)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long admin email list', () => {
      const emails = Array.from({ length: 1000 }, (_, i) => `admin${i}@example.com`);
      process.env.ADMIN_EMAILS = emails.join(',');

      const adminList = getAdminEmails();

      expect(adminList).toHaveLength(1000);
      expect(isAdminEmail('admin500@example.com')).toBe(true);
      expect(isAdminEmail('user@example.com')).toBe(false);
    });

    it('should handle malformed email addresses gracefully', () => {
      process.env.ADMIN_EMAILS = 'invalid-email,admin@example.com,@example.com';

      const emails = getAdminEmails();

      expect(emails).toContain('admin@example.com');
      expect(emails).toContain('invalid-email'); // Still included, just invalid
    });

    it('should handle concurrent admin checks', async () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      vi.mocked(auth).mockResolvedValue({
        user: { id: '123', email: 'admin@example.com', name: 'Admin' },
        expires: '2025-12-31',
      });

      const results = await Promise.all([
        isAdmin(),
        isAdmin(),
        isAdmin(),
      ]);

      expect(results).toEqual([true, true, true]);
    });
  });
});
