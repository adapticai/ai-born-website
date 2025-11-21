import createMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

/**
 * Next.js configuration for AI-Born landing page
 *
 * Performance targets from CLAUDE.md:
 * - LCP (Largest Contentful Paint): ≤2.0s on 4G
 * - TBT (Total Blocking Time): ≤150ms
 * - CLS (Cumulative Layout Shift): ≤0.1
 * - Lighthouse Score: ≥95
 */
const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  images: {
    // Enable image optimization for performance (LCP ≤2.0s target)
    unoptimized: false,

    // Supported image formats with WebP as default
    formats: ["image/webp", "image/avif"],

    // Device sizes for responsive images (matches common breakpoints)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes for different layout contexts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Allow SVG logos with security policy
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // External image domains (retailer logos, press logos, etc.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],

    // Minimize layout shift (CLS ≤0.1 target)
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for static assets
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  /**
   * Security headers for static assets
   *
   * These headers are applied via next.config.ts for static files
   * and supplemented by middleware.ts for dynamic routes
   */
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), bluetooth=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(self), gamepad=(), gyroscope=(), hid=(), idle-detection=(), local-fonts=(), magnetometer=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), usb=(), web-share=(), xr-spatial-tracking=()",
          },
        ],
      },
      {
        // Cache control for fonts
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache control for optimized images
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache control for static build assets
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache control for public assets (logos, images, etc.)
        source: "/logos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Cache control for public images
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};
const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/**
 * Sentry configuration for error tracking and performance monitoring
 *
 * Features:
 * - Automatic source maps upload for production debugging
 * - Webpack plugin for build-time instrumentation
 * - Release tracking via Git commit SHA
 * - Tree-shaking friendly configuration
 */
const sentryWebpackPluginOptions = {
  // Only upload source maps in production builds
  silent: process.env.NODE_ENV !== 'production',

  // Automatically annotate React components for better error messages
  reactComponentAnnotation: {
    enabled: true,
  },

  // Hide source maps from client-side bundles (security)
  hideSourceMaps: true,

  // Disable Sentry CLI prompts in CI/CD
  telemetry: false,

  // Suppress Webpack plugin logging (keep builds clean)
  widenClientFileUpload: true,

  // Upload source maps to Sentry for production debugging
  // Requires SENTRY_AUTH_TOKEN environment variable
  automaticVercelMonitors: true,

  // Organization and project configuration
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

// Wrap config with MDX support, then Sentry
// Order matters: MDX processes files, then Sentry instruments the output
const configWithMDX = withMDX(nextConfig);

// Only wrap with Sentry if DSN is configured (allows development without Sentry)
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithMDX, sentryWebpackPluginOptions)
  : configWithMDX;
