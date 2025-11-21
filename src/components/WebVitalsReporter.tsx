'use client';

/**
 * Web Vitals Reporter Component
 * Automatically tracks Core Web Vitals metrics and sends to GTM dataLayer
 * Integrates with Vercel Analytics for comprehensive performance monitoring
 */

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { trackWebVital } from '@/lib/analytics';

/**
 * Web Vitals Reporter
 *
 * Uses Next.js built-in Web Vitals hook to capture and report metrics
 * Tracks: LCP, FID, CLS, INP, TTFB, FCP
 *
 * Metrics are sent to:
 * 1. GTM dataLayer for custom analytics
 * 2. Vercel Analytics (automatically via Analytics component)
 * 3. Console in development mode
 *
 * Performance budgets from CLAUDE.md:
 * - LCP: ≤2.0s
 * - TBT: ≤150ms
 * - CLS: ≤0.1
 * - FID: ≤100ms
 * - INP: ≤200ms
 * - TTFB: ≤600ms
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Track all Web Vitals metrics
    trackWebVital(metric);
  });

  // Log performance budgets in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Budgets (CLAUDE.md)');
      console.log('LCP (Largest Contentful Paint): ≤2.0s');
      console.log('FID (First Input Delay): ≤100ms');
      console.log('INP (Interaction to Next Paint): ≤200ms');
      console.log('CLS (Cumulative Layout Shift): ≤0.1');
      console.log('TBT (Total Blocking Time): ≤150ms');
      console.log('TTFB (Time to First Byte): ≤600ms');
      console.groupEnd();
    }
  }, []);

  return null;
}
