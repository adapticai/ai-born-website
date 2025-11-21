/**
 * Type definitions for middleware security implementation
 */

/**
 * Rate limit store entry
 */
export interface RateLimitStore {
  count: number;
  resetTime: number;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * CSP directive configuration
 */
export interface CSPDirectives {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  connectSrc: string[];
  mediaSrc: string[];
  objectSrc: string[];
  frameSrc: string[];
  baseUri: string[];
  formAction: string[];
  frameAncestors: string[];
}

/**
 * Security headers configuration
 */
export interface SecurityHeaders {
  contentSecurityPolicy: string;
  strictTransportSecurity: string;
  xFrameOptions: string;
  xContentTypeOptions: string;
  referrerPolicy: string;
  permissionsPolicy: string;
  xDnsPrefetchControl: string;
  xXssProtection: string;
}

/**
 * CORS configuration
 */
export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

/**
 * Middleware configuration
 */
export interface MiddlewareConfig {
  rateLimit: RateLimitConfig;
  cors: CORSConfig;
  security: Partial<SecurityHeaders>;
}
