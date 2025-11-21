import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isProtectedRoute, isAdminRoute } from "./lib/auth";
import { isAdminEmail } from "./lib/admin-auth";

/**
 * Security & Auth Middleware for AI-Born Landing Page
 *
 * Implements:
 * - Authentication checks for protected routes
 * - Content Security Policy (CSP) with nonces
 * - HSTS (HTTP Strict Transport Security)
 * - Frame protection (X-Frame-Options)
 * - Content-Type sniffing prevention
 * - Referrer policy
 * - Permissions policy
 * - HTTPS enforcement
 * - Rate limiting headers
 * - CORS configuration
 */

// Rate limiting configuration
interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

/**
 * Generate a cryptographically secure nonce for CSP
 */
function generateNonce(): string {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  return Buffer.from(buffer).toString("base64");
}

/**
 * Build Content Security Policy header
 */
function buildCSP(nonce: string): string {
  const cspDirectives = [
    // Default fallback
    "default-src 'self'",

    // Scripts: self, nonce for inline, and trusted CDNs
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.vercel-insights.com https://va.vercel-scripts.com`,

    // Styles: self, inline (for Tailwind), and Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Images: self, data URIs, and common CDNs
    "img-src 'self' data: https: blob:",

    // Fonts: self and Google Fonts
    "font-src 'self' https://fonts.gstatic.com data:",

    // Connections: self and analytics/monitoring services
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://vitals.vercel-insights.com https://region1.google-analytics.com",

    // Media: self and trusted sources
    "media-src 'self' https:",

    // Objects: none (prevents Flash, Java, etc.)
    "object-src 'none'",

    // Frames: specific trusted sources only
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",

    // Base URI: restrict to self
    "base-uri 'self'",

    // Form actions: self only
    "form-action 'self'",

    // Frame ancestors: deny (same as X-Frame-Options: DENY)
    "frame-ancestors 'none'",

    // Upgrade insecure requests
    "upgrade-insecure-requests",

    // Block all mixed content
    "block-all-mixed-content",
  ];

  return cspDirectives.join("; ");
}

/**
 * Build Permissions Policy header
 */
function buildPermissionsPolicy(): string {
  const permissions = [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()", // Disable FLoC
    "accelerometer=()",
    "ambient-light-sensor=()",
    "autoplay=()",
    "battery=()",
    "bluetooth=()",
    "display-capture=()",
    "document-domain=()",
    "encrypted-media=()",
    "execution-while-not-rendered=()",
    "execution-while-out-of-viewport=()",
    "fullscreen=(self)",
    "gamepad=()",
    "gyroscope=()",
    "hid=()",
    "idle-detection=()",
    "local-fonts=()",
    "magnetometer=()",
    "midi=()",
    "payment=()",
    "picture-in-picture=()",
    "publickey-credentials-get=()",
    "screen-wake-lock=()",
    "serial=()",
    "speaker-selection=()",
    "usb=()",
    "web-share=()",
    "xr-spatial-tracking=()",
  ];

  return permissions.join(", ");
}

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip: string): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const clientLimit = rateLimitStore.get(ip);

  if (!clientLimit || now > clientLimit.resetTime) {
    // New window or expired
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetTime });
    return { limited: false, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime };
  }

  if (clientLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    return { limited: true, remaining: 0, resetTime: clientLimit.resetTime };
  }

  // Increment count
  clientLimit.count += 1;
  rateLimitStore.set(ip, clientLimit);
  return { limited: false, remaining: RATE_LIMIT_MAX_REQUESTS - clientLimit.count, resetTime: clientLimit.resetTime };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // HTTPS Enforcement (redirect HTTP to HTTPS in production)
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get("host")}${pathname}`,
      301
    );
  }

  // Authentication check for protected routes
  if (isProtectedRoute(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to sign-in if not authenticated
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Additional check for admin routes
    if (isAdminRoute(pathname)) {
      const userEmail = token.email as string | undefined;

      // Check if user has admin privileges
      if (!userEmail || !isAdminEmail(userEmail)) {
        // Redirect to unauthorized page
        const unauthorizedUrl = new URL("/unauthorized", request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }
  }

  // Skip auth routes from further processing
  if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
    const response = NextResponse.next();
    return applySecurityHeaders(response, request);
  }

  // Rate Limiting (stricter for API routes)
  const isAPIRoute = pathname.startsWith("/api");
  if (isAPIRoute) {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    if (rateLimit.limited) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(rateLimit.resetTime).toISOString());

    return applySecurityHeaders(response, request);
  }

  // Apply security headers to all responses
  const response = NextResponse.next();
  return applySecurityHeaders(response, request);
}

/**
 * Apply all security headers to the response
 */
function applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const nonce = generateNonce();

  // Store nonce in request headers for use in components
  response.headers.set("x-nonce", nonce);

  // Content Security Policy
  response.headers.set("Content-Security-Policy", buildCSP(nonce));

  // HTTP Strict Transport Security (HSTS)
  // max-age=31536000 (1 year), includeSubDomains, preload
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // X-Frame-Options (defense in depth with CSP frame-ancestors)
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options (prevent MIME sniffing)
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  response.headers.set("Permissions-Policy", buildPermissionsPolicy());

  // X-DNS-Prefetch-Control (control DNS prefetching)
  response.headers.set("X-DNS-Prefetch-Control", "on");

  // X-XSS-Protection (legacy, but still useful for older browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // CORS headers for API routes
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL || "https://ai-born.org",
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
      response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
    }
  }

  // Vary header for caching
  response.headers.set("Vary", "Accept-Encoding, User-Agent");

  return response;
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
