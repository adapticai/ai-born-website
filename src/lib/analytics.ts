/**
 * Analytics & GTM Event Tracking Utilities
 */

import { isBrowser } from './utils';

import type { AnalyticsEvent } from '@/types';

/**
 * Check if GTM is loaded and available
 */
function isGTMAvailable(): boolean {
  return isBrowser() && typeof window.dataLayer !== 'undefined';
}

/**
 * Initialize GTM dataLayer if it doesn't exist
 */
function initializeDataLayer(): void {
  if (isBrowser() && !window.dataLayer) {
    window.dataLayer = [];
  }
}

/**
 * Track an analytics event through GTM dataLayer
 * Safe for SSR - will not execute on server
 * 
 * @param event - Analytics event object with event name and properties
 * @example
 * trackEvent({
 *   event: 'preorder_click',
 *   retailer: 'amazon',
 *   format: 'hardcover'
 * })
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!isBrowser()) {
    // Don't track on server side
    return;
  }

  // Initialize dataLayer if needed
  initializeDataLayer();

  // Add timestamp if not provided
  const eventWithTimestamp = {
    ...event,
    timestamp: event.timestamp || Date.now(),
  };

  // Push to GTM dataLayer
  try {
    window.dataLayer?.push(eventWithTimestamp);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventWithTimestamp);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Track a page view event
 * 
 * @param path - Page path to track
 * @param title - Page title
 */
export function trackPageView(path: string, title?: string): void {
  // Push specific page view to dataLayer
  if (isGTMAvailable()) {
    window.dataLayer?.push({
      event: 'page_view',
      page_path: path,
      page_title: title || document.title,
    });
  }
}

/**
 * Track scroll depth at specific percentages
 * 
 * @param elementId - ID of element to track
 * @param percentage - Scroll depth percentage (25, 50, 75, 100)
 */
export function trackScrollDepth(elementId: string, percentage: number): void {
  trackEvent({
    event: 'overview_read_depth',
    pct: percentage,
  });
}

/**
 * Track outbound link clicks
 * 
 * @param url - Destination URL
 * @param linkText - Text of the link
 */
export function trackOutboundClick(url: string, linkText?: string): void {
  if (!isGTMAvailable()) return;

  window.dataLayer?.push({
    event: 'outbound_click',
    link_url: url,
    link_text: linkText,
  });
}

/**
 * Track form submission
 * 
 * @param formId - Form identifier
 * @param success - Whether submission was successful
 */
export function trackFormSubmit(formId: string, success: boolean): void {
  if (!isGTMAvailable()) return;

  window.dataLayer?.push({
    event: 'form_submit',
    form_id: formId,
    form_success: success,
  });
}

/**
 * Track file downloads
 * 
 * @param fileName - Name of downloaded file
 * @param fileType - Type of file (pdf, zip, etc)
 */
export function trackDownload(fileName: string, fileType: string): void {
  if (!isGTMAvailable()) return;

  window.dataLayer?.push({
    event: 'file_download',
    file_name: fileName,
    file_type: fileType,
  });
}

/**
 * Track video interactions
 * 
 * @param videoId - Video identifier
 * @param action - Action performed (play, pause, complete)
 * @param percentage - Playback percentage (optional)
 */
export function trackVideo(
  videoId: string,
  action: 'play' | 'pause' | 'complete',
  percentage?: number
): void {
  if (!isGTMAvailable()) return;

  window.dataLayer?.push({
    event: 'video_interaction',
    video_id: videoId,
    video_action: action,
    video_percentage: percentage,
  });
}

/**
 * Set user properties in GTM
 * 
 * @param properties - User properties to set
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!isGTMAvailable()) return;

  window.dataLayer?.push({
    event: 'user_properties_set',
    ...properties,
  });
}

/**
 * Clear the dataLayer (useful for testing)
 */
export function clearDataLayer(): void {
  if (isBrowser() && window.dataLayer) {
    window.dataLayer = [];
  }
}
