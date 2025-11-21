/**
 * Client-Side Performance Monitoring Hook
 *
 * Monitors and tracks:
 * - Route changes and navigation timing
 * - Component render performance
 * - Web Vitals (LCP, FID, CLS, etc.)
 * - Custom performance marks
 *
 * Usage:
 * ```typescript
 * // In a component
 * usePerformanceMonitor('MyComponent');
 *
 * // With custom tracking
 * const { trackEvent, trackRender } = usePerformanceMonitor('MyComponent');
 * trackEvent('user_interaction', { action: 'click' });
 * ```
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { trackWebVital } from '@/lib/analytics';
import type { Metric } from 'web-vitals';

// ============================================================================
// Types
// ============================================================================

export interface PerformanceMonitorOptions {
  /** Enable automatic route change tracking */
  trackRouteChanges?: boolean;
  /** Enable automatic render time tracking */
  trackRenderTime?: boolean;
  /** Enable Web Vitals tracking */
  trackWebVitals?: boolean;
  /** Custom performance threshold (ms) for warnings */
  slowRenderThreshold?: number;
}

export interface PerformanceMonitorAPI {
  /** Track a custom performance event */
  trackEvent: (name: string, metadata?: Record<string, unknown>) => void;
  /** Track component render time */
  trackRender: (componentName?: string) => void;
  /** Create a performance mark */
  mark: (name: string) => void;
  /** Measure duration between two marks */
  measure: (name: string, startMark: string, endMark?: string) => number;
}

// ============================================================================
// Web Vitals Integration
// ============================================================================

/**
 * Initialize Web Vitals tracking
 * Called once on mount
 */
function initializeWebVitals() {
  if (typeof window === 'undefined') return;

  // Only load web-vitals on client side
  import('web-vitals').then((webVitals) => {
    // Track all Core Web Vitals
    webVitals.onCLS(trackWebVital);
    // FID is deprecated in favor of INP
    webVitals.onLCP(trackWebVital);
    webVitals.onINP(trackWebVital);
    webVitals.onTTFB(trackWebVital);
    webVitals.onFCP(trackWebVital);
  });
}

// ============================================================================
// Route Change Tracking
// ============================================================================

/**
 * Track route change performance
 */
function trackRouteChange(path: string, duration: number) {
  if (typeof window === 'undefined') return;

  // Send to dataLayer for GTM
  window.dataLayer?.push({
    event: 'route_change',
    page_path: path,
    route_duration: Math.round(duration),
    timestamp: new Date().toISOString(),
  });

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] Route change to ${path}: ${Math.round(duration)}ms`);
  }
}

// ============================================================================
// Component Render Tracking
// ============================================================================

/**
 * Track component render time
 */
function trackComponentRender(
  componentName: string,
  duration: number,
  slowThreshold = 16 // Default: 1 frame at 60fps
) {
  if (typeof window === 'undefined') return;

  const isSlow = duration > slowThreshold;

  // Log slow renders in development
  if (process.env.NODE_ENV === 'development' && isSlow) {
    console.warn(
      `[Performance] Slow render: ${componentName} took ${Math.round(duration)}ms (threshold: ${slowThreshold}ms)`
    );
  }

  // Send to dataLayer
  window.dataLayer?.push({
    event: 'component_render',
    component_name: componentName,
    render_duration: Math.round(duration),
    is_slow: isSlow,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Performance Hook
// ============================================================================

/**
 * Hook for monitoring component and route performance
 *
 * @param componentName - Name of the component being monitored
 * @param options - Monitoring options
 * @returns Performance monitoring API
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { trackEvent, trackRender } = usePerformanceMonitor('MyComponent', {
 *     trackRenderTime: true,
 *     slowRenderThreshold: 50
 *   });
 *
 *   const handleClick = () => {
 *     trackEvent('button_clicked', { buttonId: 'submit' });
 *   };
 *
 *   return <button onClick={handleClick}>Submit</button>;
 * }
 * ```
 */
export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
): PerformanceMonitorAPI {
  const {
    trackRouteChanges = true,
    trackRenderTime = false,
    trackWebVitals = true,
    slowRenderThreshold = 16,
  } = options;

  const pathname = usePathname();
  const renderStartRef = useRef<number>(0);
  const previousPathRef = useRef<string>(pathname);
  const routeChangeStartRef = useRef<number>(0);
  const webVitalsInitialized = useRef(false);

  // Initialize Web Vitals tracking (once)
  useEffect(() => {
    if (trackWebVitals && !webVitalsInitialized.current) {
      initializeWebVitals();
      webVitalsInitialized.current = true;
    }
  }, [trackWebVitals]);

  // Track route changes
  useEffect(() => {
    if (!trackRouteChanges) return;

    const previousPath = previousPathRef.current;

    if (previousPath !== pathname) {
      // Route changed
      const duration = performance.now() - routeChangeStartRef.current;

      if (routeChangeStartRef.current > 0) {
        trackRouteChange(pathname, duration);
      }

      previousPathRef.current = pathname;
      routeChangeStartRef.current = performance.now();
    }
  }, [pathname, trackRouteChanges]);

  // Track component render time
  useEffect(() => {
    if (!trackRenderTime) return;

    const renderStart = renderStartRef.current;

    if (renderStart > 0) {
      const renderDuration = performance.now() - renderStart;
      trackComponentRender(componentName, renderDuration, slowRenderThreshold);
    }

    renderStartRef.current = performance.now();
  });

  // Set render start time on mount
  useEffect(() => {
    renderStartRef.current = performance.now();
  }, []);

  // API methods
  const trackEvent = useCallback(
    (name: string, metadata?: Record<string, unknown>) => {
      if (typeof window === 'undefined') return;

      window.dataLayer?.push({
        event: 'performance_event',
        event_name: name,
        component: componentName,
        ...metadata,
        timestamp: new Date().toISOString(),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] Event: ${name}`, metadata);
      }
    },
    [componentName]
  );

  const trackRenderManual = useCallback(
    (customComponentName?: string) => {
      const name = customComponentName || componentName;
      const renderStart = renderStartRef.current;

      if (renderStart > 0) {
        const duration = performance.now() - renderStart;
        trackComponentRender(name, duration, slowRenderThreshold);
      }

      renderStartRef.current = performance.now();
    },
    [componentName, slowRenderThreshold]
  );

  const mark = useCallback((name: string) => {
    if (typeof window === 'undefined' || !window.performance) return;

    try {
      window.performance.mark(name);
    } catch (error) {
      console.error('Failed to create performance mark:', error);
    }
  }, []);

  const measure = useCallback((name: string, startMark: string, endMark?: string) => {
    if (typeof window === 'undefined' || !window.performance) return 0;

    try {
      const measureName = `${name}_measure`;

      if (endMark) {
        window.performance.measure(measureName, startMark, endMark);
      } else {
        window.performance.measure(measureName, startMark);
      }

      const measures = window.performance.getEntriesByName(measureName, 'measure');
      const measure = measures[measures.length - 1];

      if (measure) {
        // Clean up marks and measures
        window.performance.clearMarks(startMark);
        if (endMark) window.performance.clearMarks(endMark);
        window.performance.clearMeasures(measureName);

        return measure.duration;
      }
    } catch (error) {
      console.error('Failed to measure performance:', error);
    }

    return 0;
  }, []);

  return {
    trackEvent,
    trackRender: trackRenderManual,
    mark,
    measure,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook for tracking async operations
 *
 * @example
 * ```typescript
 * const trackOperation = useOperationTracker();
 *
 * async function fetchData() {
 *   const endTracking = trackOperation('fetchData');
 *   try {
 *     const data = await fetch('/api/data');
 *     endTracking(true);
 *     return data;
 *   } catch (error) {
 *     endTracking(false, error);
 *     throw error;
 *   }
 * }
 * ```
 */
export function useOperationTracker() {
  return useCallback(
    (operationName: string) => {
      const startTime = performance.now();

      return (success = true, error?: unknown) => {
        const duration = performance.now() - startTime;

        if (typeof window !== 'undefined') {
          window.dataLayer?.push({
            event: 'operation_tracked',
            operation_name: operationName,
            duration: Math.round(duration),
            success,
            error: error instanceof Error ? error.message : undefined,
            timestamp: new Date().toISOString(),
          });
        }

        if (process.env.NODE_ENV === 'development') {
          const status = success ? 'SUCCESS' : 'FAILED';
          console.log(
            `[Performance] ${operationName} ${status}: ${Math.round(duration)}ms`
          );
        }
      };
    },
    []
  );
}

/**
 * Hook for tracking navigation performance
 * Automatically tracks all route changes
 */
export function useNavigationTracker() {
  const pathname = usePathname();
  const navigationStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const duration = Date.now() - navigationStartRef.current;

    if (duration > 0 && duration < 60000) {
      // Only track if < 60s (ignore stale timers)
      trackRouteChange(pathname, duration);
    }

    navigationStartRef.current = Date.now();
  }, [pathname]);
}

/**
 * Hook for reporting performance metrics on unmount
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   usePerformanceReport('MyComponent', {
 *     interactions: 42,
 *     dataFetched: true
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePerformanceReport(
  componentName: string,
  metrics?: Record<string, unknown>
) {
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    return () => {
      const lifetimeDuration = Date.now() - mountTimeRef.current;

      if (typeof window !== 'undefined') {
        window.dataLayer?.push({
          event: 'component_unmount',
          component_name: componentName,
          lifetime_duration: lifetimeDuration,
          ...metrics,
          timestamp: new Date().toISOString(),
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Performance] ${componentName} unmounted after ${Math.round(lifetimeDuration)}ms`,
          metrics
        );
      }
    };
  }, [componentName, metrics]);
}
