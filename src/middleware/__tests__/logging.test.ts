/**
 * Tests for logging middleware
 *
 * Run with: npm test src/middleware/__tests__/logging.test.ts
 */

import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  extractRequestContext,
  generateRequestId,
} from '../logging';

// Mock NextRequest
function createMockRequest(options: {
  method?: string;
  pathname?: string;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
} = {}): NextRequest {
  const {
    method = 'GET',
    pathname = '/api/test',
    headers = {},
    searchParams = {},
  } = options;

  const url = new URL(`http://localhost:3000${pathname}`);
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const mockHeaders = new Headers(headers);

  return {
    method,
    nextUrl: url,
    headers: mockHeaders,
  } as unknown as NextRequest;
}

describe('Logging Middleware', () => {
  describe('extractRequestContext', () => {
    it('should extract basic request information', () => {
      const request = createMockRequest({
        method: 'POST',
        pathname: '/api/submit',
      });

      const context = extractRequestContext(request);

      expect(context.method).toBe('POST');
      expect(context.path).toBe('/api/submit');
    });

    it('should extract search parameters', () => {
      const request = createMockRequest({
        pathname: '/api/test',
        searchParams: {
          foo: 'bar',
          baz: 'qux',
        },
      });

      const context = extractRequestContext(request);

      expect(context.searchParams).toEqual({
        foo: 'bar',
        baz: 'qux',
      });
    });

    it('should extract user agent', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Test Browser/1.0',
        },
      });

      const context = extractRequestContext(request);

      expect(context.userAgent).toBe('Test Browser/1.0');
    });

    it('should extract referer', () => {
      const request = createMockRequest({
        headers: {
          'referer': 'https://example.com',
        },
      });

      const context = extractRequestContext(request);

      expect(context.referer).toBe('https://example.com');
    });

    it('should extract IP address from x-forwarded-for', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const context = extractRequestContext(request);

      expect(context.ip).toBe('192.168.1.1');
    });

    it('should extract IP address from x-real-ip', () => {
      const request = createMockRequest({
        headers: {
          'x-real-ip': '192.168.1.1',
        },
      });

      const context = extractRequestContext(request);

      expect(context.ip).toBe('192.168.1.1');
    });

    it('should use "unknown" if no IP headers present', () => {
      const request = createMockRequest();

      const context = extractRequestContext(request);

      expect(context.ip).toBe('unknown');
    });

    it('should include request headers', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Test',
          'referer': 'https://example.com',
        },
      });

      const context = extractRequestContext(request);

      expect(context.headers).toBeDefined();
      expect(context.headers).toHaveProperty('user-agent');
    });
  });
});
