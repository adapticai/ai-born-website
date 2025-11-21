/**
 * Tests for logging infrastructure
 *
 * Run with: npm test src/lib/__tests__/logger.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  logger,
  createLogger,
  generateRequestId,
  formatError,
  createModuleLogger,
} from '../logger';

describe('Logger Infrastructure', () => {
  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();

      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatError', () => {
    it('should format Error objects correctly', () => {
      const error = new Error('Test error');
      const formatted = formatError(error);

      expect(formatted.message).toBe('Test error');
      expect(formatted.name).toBe('Error');
      expect(formatted.stack).toBeDefined();
    });

    it('should format non-Error values', () => {
      const formatted = formatError('String error');

      expect(formatted.message).toBe('String error');
      expect(formatted.stack).toBeUndefined();
    });

    it('should include error code if present', () => {
      const error = new Error('Test error') as any;
      error.code = 'ERR_TEST';

      const formatted = formatError(error);

      expect(formatted.code).toBe('ERR_TEST');
    });
  });

  describe('createLogger', () => {
    it('should create child logger with context', () => {
      const childLogger = createLogger({
        requestId: 'test-123',
        userId: 'user-456',
      });

      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
    });
  });

  describe('createModuleLogger', () => {
    it('should create module-scoped logger', () => {
      const moduleLogger = createModuleLogger('TestModule');

      expect(moduleLogger).toBeDefined();
      expect(typeof moduleLogger.info).toBe('function');
    });
  });

  describe('Logger methods', () => {
    it('should expose all log level methods', () => {
      expect(typeof logger.trace).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.fatal).toBe('function');
    });

    it('should expose utility methods', () => {
      expect(typeof logger.http).toBe('function');
      expect(typeof logger.analytics).toBe('function');
      expect(typeof logger.performance).toBe('function');
      expect(typeof logger.child).toBe('function');
    });
  });

  describe('PII Redaction', () => {
    it('should handle logging without throwing', () => {
      // Test that PII fields don't cause errors
      expect(() => {
        logger.info({
          email: 'test@example.com',
          password: 'secret',
          token: 'xyz123',
        }, 'Test log');
      }).not.toThrow();
    });
  });

  describe('Analytics logging', () => {
    it('should log analytics events without throwing', () => {
      expect(() => {
        logger.analytics({
          event: 'test_event',
          userId: '123',
          properties: {
            action: 'click',
          },
        });
      }).not.toThrow();
    });
  });

  describe('Performance logging', () => {
    it('should log performance metrics without throwing', () => {
      expect(() => {
        logger.performance({
          name: 'test_metric',
          value: 123,
          unit: 'ms',
          context: {
            source: 'test',
          },
        });
      }).not.toThrow();
    });
  });

  describe('HTTP logging', () => {
    it('should log HTTP requests without throwing', () => {
      expect(() => {
        logger.http({
          method: 'GET',
          path: '/api/test',
          statusCode: 200,
          duration: 123,
          requestId: 'req_123',
        });
      }).not.toThrow();
    });
  });
});
