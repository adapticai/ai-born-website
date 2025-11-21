/**
 * Production-grade structured logging infrastructure
 *
 * Features:
 * - Environment-aware configuration (pretty in dev, JSON in prod)
 * - Automatic PII redaction
 * - Request context injection
 * - TypeScript-safe logging functions
 * - Performance optimized with Pino
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.info({ userId: '123', action: 'login' }, 'User logged in');
 * logger.error({ err, userId: '123' }, 'Failed to process request');
 * ```
 */

import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';

// ============================================================================
// Types
// ============================================================================

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

export interface ErrorContext extends LogContext {
  err: Error | unknown;
  stack?: string;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// ============================================================================
// Configuration
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = (process.env.LOG_LEVEL as LogLevel) || (isDevelopment ? 'debug' : 'info');

/**
 * PII (Personally Identifiable Information) fields to redact
 */
const PII_FIELDS = [
  'email',
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'creditCard',
  'ssn',
  'phoneNumber',
  'address',
];

/**
 * Redact PII from log objects
 */
function redactPII(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...obj };

  for (const key of Object.keys(redacted)) {
    // Check if key matches PII field patterns
    const lowerKey = key.toLowerCase();
    const isPII = PII_FIELDS.some(field => lowerKey.includes(field.toLowerCase()));

    if (isPII) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactPII(redacted[key] as Record<string, unknown>);
    }
  }

  return redacted;
}

/**
 * Check if running in Edge Runtime
 */
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

/**
 * Check if running on client-side
 */
const isClient = typeof window !== 'undefined';

/**
 * Pino logger configuration
 */
const pinoConfig: LoggerOptions = {
  level: logLevel,

  // Development: pretty-print for readability (disabled in Turbopack due to worker thread issues)
  // Production: JSON for parsing and aggregation
  ...(isDevelopment && !isEdgeRuntime && process.env.NEXT_RUNTIME !== 'edge' && {
    // Disabled pino-pretty to avoid Turbopack worker thread issues
    // transport: {
    //   target: 'pino-pretty',
    //   options: {
    //     colorize: true,
    //     translateTime: 'HH:MM:ss.l',
    //     ignore: 'pid,hostname',
    //     singleLine: false,
    //   },
    // },
  }),

  // Production configuration
  ...(isProduction && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),

  // Base properties included in all logs (edge-compatible)
  base: {
    env: process.env.NODE_ENV,
    // pid removed for Edge Runtime compatibility
  },

  // Redact sensitive fields
  redact: {
    paths: PII_FIELDS,
    censor: '[REDACTED]',
  },

  // Serialize errors properly
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
};

// ============================================================================
// Logger Instance
// ============================================================================

/**
 * Base Pino logger instance (server-side only)
 */
export const pino_logger = isClient ? null : pino(pinoConfig);

/**
 * Enhanced logger with typed methods and automatic PII redaction
 * Works on both client and server
 */
class Logger {
  private logger: PinoLogger | null;

  constructor(logger: PinoLogger | null) {
    this.logger = logger;
  }

  /**
   * Client-safe logging method
   */
  private clientLog(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal', context: any, message?: string): void {
    if (isClient) {
      const consoleMethod = level === 'fatal' ? 'error' : level;
      if (message) {
        console[consoleMethod](message, context);
      } else {
        console[consoleMethod](context);
      }
    }
  }

  /**
   * Create child logger with persistent context
   */
  child(context: LogContext): Logger {
    if (isClient || !this.logger) {
      // On client, return the same logger (no child logger support)
      return this;
    }
    const sanitizedContext = redactPII(context as Record<string, unknown>);
    return new Logger(this.logger.child(sanitizedContext));
  }

  /**
   * Trace level logging (most verbose)
   */
  trace(context: LogContext | string, message?: string): void {
    if (isClient) {
      this.clientLog('trace', context, message);
      return;
    }

    if (!this.logger) return;

    if (typeof context === 'string') {
      this.logger.trace(context);
    } else {
      const sanitized = redactPII(context as Record<string, unknown>);
      this.logger.trace(sanitized, message);
    }
  }

  /**
   * Debug level logging
   */
  debug(context: LogContext | string, message?: string): void {
    if (isClient) {
      this.clientLog('debug', context, message);
      return;
    }

    if (!this.logger) return;

    if (typeof context === 'string') {
      this.logger.debug(context);
    } else {
      const sanitized = redactPII(context as Record<string, unknown>);
      this.logger.debug(sanitized, message);
    }
  }

  /**
   * Info level logging (default)
   */
  info(context: LogContext | string, message?: string): void {
    if (isClient) {
      this.clientLog('info', context, message);
      return;
    }

    if (!this.logger) return;

    if (typeof context === 'string') {
      this.logger.info(context);
    } else {
      const sanitized = redactPII(context as Record<string, unknown>);
      this.logger.info(sanitized, message);
    }
  }

  /**
   * Warn level logging
   */
  warn(context: LogContext | string, message?: string): void {
    if (isClient) {
      this.clientLog('warn', context, message);
      return;
    }

    if (!this.logger) return;

    if (typeof context === 'string') {
      this.logger.warn(context);
    } else {
      const sanitized = redactPII(context as Record<string, unknown>);
      this.logger.warn(sanitized, message);
    }
  }

  /**
   * Error level logging
   */
  error(context: ErrorContext | string, message?: string): void {
    if (isClient) {
      this.clientLog('error', context, message);
      return;
    }

    if (!this.logger) return;

    if (typeof context === 'string') {
      this.logger.error(context);
    } else {
      const sanitized = redactPII(context as Record<string, unknown>);

      // Extract error object for proper serialization
      if (context.err instanceof Error) {
        this.logger.error({ ...sanitized, err: context.err }, message);
      } else {
        this.logger.error(sanitized, message);
      }
    }
  }

  /**
   * Fatal level logging (process should exit after)
   */
  fatal(context: ErrorContext | string, message?: string): void {
    if (isClient) {
      this.clientLog('fatal', context, message);
      return;
    }

    if (!this.logger) return;

    if (typeof context === 'string') {
      this.logger.fatal(context);
    } else {
      const sanitized = redactPII(context as Record<string, unknown>);

      if (context.err instanceof Error) {
        this.logger.fatal({ ...sanitized, err: context.err }, message);
      } else {
        this.logger.fatal(sanitized, message);
      }
    }
  }

  /**
   * Log HTTP request/response
   */
  http(context: LogContext & {
    method: string;
    path: string;
    statusCode: number;
    duration: number;
  }): void {
    if (isClient) {
      const level = context.statusCode >= 500 ? 'error' :
                    context.statusCode >= 400 ? 'warn' : 'info';
      this.clientLog(level, context, `${context.method} ${context.path} ${context.statusCode} ${context.duration}ms`);
      return;
    }

    if (!this.logger) return;

    const sanitized = redactPII(context as Record<string, unknown>);

    const level = context.statusCode >= 500 ? 'error' :
                  context.statusCode >= 400 ? 'warn' : 'info';

    this.logger[level](
      sanitized,
      `${context.method} ${context.path} ${context.statusCode} ${context.duration}ms`
    );
  }

  /**
   * Log analytics event
   */
  analytics(event: {
    event: string;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, unknown>;
  }): void {
    if (isClient) {
      this.clientLog('info', event, `Analytics: ${event.event}`);
      return;
    }

    if (!this.logger) return;

    const sanitized = redactPII(event as Record<string, unknown>);
    this.logger.info({ ...sanitized, type: 'analytics' }, `Analytics: ${event.event}`);
  }

  /**
   * Log performance metric
   */
  performance(metric: {
    name: string;
    value: number;
    unit: string;
    context?: LogContext;
  }): void {
    if (isClient) {
      this.clientLog('info', metric, `Performance: ${metric.name} = ${metric.value}${metric.unit}`);
      return;
    }

    if (!this.logger) return;

    const sanitized = redactPII(metric as Record<string, unknown>);
    this.logger.info(
      { ...sanitized, type: 'performance' },
      `Performance: ${metric.name} = ${metric.value}${metric.unit}`
    );
  }
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Default logger instance
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.info({ userId: '123' }, 'User action');
 * logger.error({ err: error }, 'Operation failed');
 * ```
 */
export const logger = new Logger(pino_logger);

/**
 * Create a child logger with persistent context
 *
 * Usage:
 * ```typescript
 * const requestLogger = createLogger({ requestId: '123', userId: '456' });
 * requestLogger.info('Processing request'); // Includes requestId and userId
 * ```
 */
export function createLogger(context: LogContext): Logger {
  return logger.child(context);
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format error for logging
 */
export function formatError(error: unknown): {
  message: string;
  stack?: string;
  code?: string;
  name?: string;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    };
  }

  return {
    message: String(error),
  };
}

/**
 * Log function execution time
 */
export async function logExecutionTime<T>(
  name: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    logger.performance({
      name,
      value: duration,
      unit: 'ms',
      context,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    logger.error(
      {
        err: error,
        duration,
        functionName: name,
        ...context,
      },
      `Function ${name} failed after ${duration}ms`
    );

    throw error;
  }
}

/**
 * Create a logger for a specific module/component
 */
export function createModuleLogger(moduleName: string): Logger {
  return logger.child({ module: moduleName });
}
