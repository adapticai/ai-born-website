/**
 * Analytics & GTM Event Tracking Utilities
 * Production-ready typed helper functions for tracking events
 * Includes Vercel Analytics and Web Vitals integration
 */

import { isBrowser } from './utils';
import type { Metric } from 'web-vitals';

import type {
  AnalyticsEvent,
  BookFormat,
  GeoRegion,
  PreorderClickEvent,
  LeadCaptureSubmitEvent,
  BonusClaimSubmitEvent,
  HeroCTAClickEvent,
  RetailerMenuOpenEvent,
  FrameworkCardOpenEvent,
  OverviewReadDepthEvent,
  SocialProofViewEvent,
  EndorsementExpandEvent,
  EndorsementTabChangeEvent,
  FAQOpenEvent,
  PresskitDownloadEvent,
  AuthorPressDownloadEvent,
  MediaRequestSubmitEvent,
  BulkInterestSubmitEvent,
  VideoPlayEvent,
  VideoCompleteEvent,
  ScrollDepthEvent,
  AnchorNavigationEvent,
  RegionSwitchEvent,
  FormatToggleEvent,
  FormErrorEvent,
  APIErrorEvent,
  NewsletterSubscribedEvent,
  VIPCodeRedeemAttemptEvent,
  VIPCodeRedeemSuccessEvent,
  VIPCodeRedeemFailureEvent,
  ExperimentAssignedEvent,
  ExperimentConversionEvent,
} from '@/types';

// ==================== Performance Budgets (from CLAUDE.md) ====================

/**
 * Performance budget thresholds from CLAUDE.md
 * LCP: ≤2.0s, TBT: ≤150ms, CLS: ≤0.1
 */
export const PERFORMANCE_BUDGETS = {
  /** Largest Contentful Paint target (seconds) */
  LCP: 2.0,
  /** First Input Delay target (milliseconds) */
  FID: 100,
  /** Interaction to Next Paint target (milliseconds) */
  INP: 200,
  /** Cumulative Layout Shift target (score) */
  CLS: 0.1,
  /** Total Blocking Time target (milliseconds) */
  TBT: 150,
  /** Time to First Byte target (milliseconds) */
  TTFB: 600,
} as const;

/**
 * Web Vitals rating thresholds
 * Based on Core Web Vitals percentile recommendations
 */
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
} as const;

// ==================== Types ====================

/**
 * Performance rating based on thresholds
 */
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Web Vitals metric names
 */
export type WebVitalName = 'LCP' | 'FID' | 'CLS' | 'INP' | 'TTFB' | 'FCP';

/**
 * Web Vitals event for GTM dataLayer
 */
export interface WebVitalsEvent {
  event: 'web_vitals';
  metric_name: WebVitalName;
  metric_value: number;
  metric_rating: PerformanceRating;
  metric_delta: number;
  metric_id: string;
  navigation_type: string;
  exceeds_budget: boolean;
  budget_threshold?: number;
  timestamp: string;
}

// ==================== Utility Functions ====================

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
 * Get performance rating for a metric
 */
function getMetricRating(name: WebVitalName, value: number): PerformanceRating {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];

  if (!thresholds) return 'good';

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Check if metric exceeds budget
 */
function exceedsBudget(name: WebVitalName, value: number): boolean {
  const budget = PERFORMANCE_BUDGETS[name as keyof typeof PERFORMANCE_BUDGETS];

  if (!budget) return false;

  // Convert LCP budget from seconds to milliseconds for comparison
  const threshold = name === 'LCP' ? budget * 1000 : budget;

  return value > threshold;
}

/**
 * Get budget threshold for metric
 */
function getBudgetThreshold(name: WebVitalName): number | undefined {
  const budget = PERFORMANCE_BUDGETS[name as keyof typeof PERFORMANCE_BUDGETS];

  if (!budget) return undefined;

  // Convert LCP budget from seconds to milliseconds
  return name === 'LCP' ? budget * 1000 : budget;
}

// ==================== Web Vitals Tracking ====================

/**
 * Track Web Vitals metric to GTM dataLayer and console
 * Integrates with existing GTM event tracking
 *
 * @param metric - Web Vitals metric object from web-vitals library
 *
 * @example
 * ```ts
 * import { onCLS, onFID, onLCP, onINP, onTTFB, onFCP } from 'web-vitals';
 *
 * onCLS(trackWebVital);
 * onFID(trackWebVital);
 * onLCP(trackWebVital);
 * onINP(trackWebVital);
 * onTTFB(trackWebVital);
 * onFCP(trackWebVital);
 * ```
 */
export function trackWebVital(metric: Metric): void {
  const { name, value, delta, id, navigationType } = metric;

  // Only track Core Web Vitals and TTFB
  const validMetrics: WebVitalName[] = ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP'];
  if (!validMetrics.includes(name as WebVitalName)) {
    return;
  }

  const metricName = name as WebVitalName;
  const rating = getMetricRating(metricName, value);
  const budgetExceeded = exceedsBudget(metricName, value);
  const threshold = getBudgetThreshold(metricName);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const budgetStatus = budgetExceeded
      ? `⚠️ EXCEEDS BUDGET (${threshold}${metricName === 'CLS' ? '' : 'ms'})`
      : `✓ Within budget (${threshold}${metricName === 'CLS' ? '' : 'ms'})`;

    console.log(
      `[Web Vitals] ${metricName}:`,
      `${Math.round(value * 100) / 100}${metricName === 'CLS' ? '' : 'ms'}`,
      `[${rating}]`,
      budgetStatus
    );
  }

  // Push to GTM dataLayer
  const webVitalsEvent: WebVitalsEvent = {
    event: 'web_vitals',
    metric_name: metricName,
    metric_value: Math.round(value * 100) / 100,
    metric_rating: rating,
    metric_delta: Math.round(delta * 100) / 100,
    metric_id: id,
    navigation_type: navigationType,
    exceeds_budget: budgetExceeded,
    budget_threshold: threshold,
    timestamp: new Date().toISOString(),
  };

  if (isGTMAvailable()) {
    window.dataLayer?.push(webVitalsEvent as unknown as AnalyticsEvent);
  }
}

// ==================== Performance Monitoring ====================

/**
 * Get current performance metrics summary
 * Useful for debugging and reporting
 */
export function getPerformanceMetrics(): Record<string, number> {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const paint = performance.getEntriesByType('paint');

  const metrics: Record<string, number> = {};

  if (navigation) {
    metrics.dns = navigation.domainLookupEnd - navigation.domainLookupStart;
    metrics.tcp = navigation.connectEnd - navigation.connectStart;
    metrics.ttfb = navigation.responseStart - navigation.requestStart;
    metrics.download = navigation.responseEnd - navigation.responseStart;
    metrics.domInteractive = navigation.domInteractive - navigation.fetchStart;
    metrics.domComplete = navigation.domComplete - navigation.fetchStart;
    metrics.loadComplete = navigation.loadEventEnd - navigation.fetchStart;
  }

  paint.forEach((entry) => {
    if (entry.name === 'first-paint') {
      metrics.fp = entry.startTime;
    } else if (entry.name === 'first-contentful-paint') {
      metrics.fcp = entry.startTime;
    }
  });

  return metrics;
}

/**
 * Log performance metrics to console
 * For development debugging
 */
export function logPerformanceMetrics(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const metrics = getPerformanceMetrics();

  console.group('[Performance Metrics]');
  Object.entries(metrics).forEach(([key, value]) => {
    console.log(`${key}:`, `${Math.round(value)}ms`);
  });
  console.groupEnd();
}

// ==================== Audience Tracking ====================

/**
 * Track user segment for audience analytics
 * Helps with user segmentation in Vercel Analytics
 *
 * @param segment - User segment identifier
 *
 * @example
 * ```ts
 * trackAudience('returning-visitor');
 * trackAudience('pre-order-customer');
 * trackAudience('vip-code-redeemed');
 * ```
 */
export function trackAudience(segment: string): void {
  if (!isGTMAvailable()) return;

  window.dataLayer?.push({
    event: 'audience_segment',
    segment,
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[Audience]', segment);
  }
}

// ==================== Conversion Tracking ====================

/**
 * Track conversion event with value
 * For pre-order and other conversion goals
 *
 * @param conversionType - Type of conversion
 * @param value - Conversion value (optional)
 * @param metadata - Additional metadata
 *
 * @example
 * ```ts
 * trackConversion('pre-order', 29.99, {
 *   retailer: 'amazon',
 *   format: 'hardcover'
 * });
 * ```
 */
export function trackConversion(
  conversionType: string,
  value?: number,
  metadata?: Record<string, unknown>
): void {
  if (!isGTMAvailable()) return;

  window.dataLayer?.push({
    event: 'conversion',
    conversion_type: conversionType,
    value,
    currency: 'USD',
    ...metadata,
    timestamp: new Date().toISOString(),
  });
}

// ==================== Core Event Tracking ====================

/**
 * Track an analytics event through GTM dataLayer
 * Safe for SSR - will not execute on server
 *
 * @param event - Analytics event object with event name and properties
 * @example
 * trackEvent({
 *   event: 'preorder_click',
 *   retailer: 'amazon',
 *   format: 'hardcover',
 *   geo: 'US'
 * })
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!isBrowser()) {
    // Don't track on server side
    return;
  }

  // Initialize dataLayer if needed
  initializeDataLayer();

  // Add timestamp and book identifier if not provided
  const eventWithMetadata: AnalyticsEvent = {
    book: 'ai-born',
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // Push to GTM dataLayer
  try {
    window.dataLayer?.push(eventWithMetadata);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventWithMetadata);
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
 * Track element scroll depth at specific percentages
 *
 * @param elementId - ID of element to track
 * @param percentage - Scroll depth percentage (25, 50, 75, 100)
 */
export function trackElementScrollDepth(elementId: string, percentage: number): void {
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

// ============================================================================
// TYPED HELPER FUNCTIONS
// Production-ready event tracking functions with full TypeScript support
// ============================================================================

/**
 * Track pre-order click (conversion event)
 * Triggered when user clicks through to retailer to purchase
 *
 * @param retailer - Retailer name (e.g., 'amazon', 'barnes-noble')
 * @param format - Book format being purchased
 * @param geo - Geographic region
 * @param campaign - Optional campaign identifier
 *
 * @example
 * trackPreorderClick('amazon', 'hardcover', 'US', 'launch-week')
 */
export function trackPreorderClick(
  retailer: string,
  format: BookFormat,
  geo: GeoRegion,
  campaign?: string
): void {
  trackEvent({
    event: 'preorder_click',
    retailer,
    format,
    geo,
    campaign,
  } as PreorderClickEvent);
}

/**
 * Track hero CTA click
 * Triggered when user clicks primary CTAs in hero section
 *
 * @param ctaId - Which CTA was clicked ('preorder' or 'excerpt')
 * @param format - Selected book format
 * @param geo - Geographic region
 * @param retailer - Selected retailer (if preorder)
 *
 * @example
 * trackHeroCTAClick('preorder', 'hardcover', 'US', 'amazon')
 */
export function trackHeroCTAClick(
  ctaId: 'preorder' | 'excerpt',
  format: BookFormat,
  geo: GeoRegion,
  retailer?: string
): void {
  trackEvent({
    event: 'hero_cta_click',
    cta_id: ctaId,
    format,
    geo,
    retailer,
  } as HeroCTAClickEvent);
}

/**
 * Track retailer menu open
 * Triggered when user opens retailer selection menu
 *
 * @param originSection - Where the menu was opened from
 *
 * @example
 * trackRetailerMenuOpen('hero')
 */
export function trackRetailerMenuOpen(
  originSection: 'hero' | 'footer' | 'bonus' | 'header' | 'mobile-header' | 'pricing-table' | 'bonus-pack-hero' | 'bonus-pack-cta'
): void {
  trackEvent({
    event: 'retailer_menu_open',
    origin_section: originSection,
  } as RetailerMenuOpenEvent);
}

/**
 * Track lead capture form submission
 * Triggered when user submits email for excerpt or newsletter
 *
 * @param source - Source of lead capture
 * @param success - Whether submission was successful
 *
 * @example
 * trackLeadCapture('hero-excerpt', true)
 */
export function trackLeadCapture(
  source: 'hero-excerpt' | 'bonus-section' | 'newsletter-footer' | 'popup',
  success: boolean = true
): void {
  trackEvent({
    event: 'lead_capture_submit',
    source,
    success,
  } as LeadCaptureSubmitEvent);
}

/**
 * Track bonus claim submission
 * Triggered when user submits proof of purchase for bonus
 *
 * @param retailer - Retailer where purchase was made
 * @param orderIdHash - Hashed order ID for privacy
 * @param receiptUploaded - Whether file was uploaded
 * @param success - Whether submission was successful
 *
 * @example
 * trackBonusClaim('amazon', 'abc123hash', true, true)
 */
export function trackBonusClaim(
  retailer: string,
  orderIdHash?: string,
  receiptUploaded: boolean = false,
  success: boolean = true
): void {
  trackEvent({
    event: 'bonus_claim_submit',
    retailer,
    order_id_hash: orderIdHash || '',
    receipt_uploaded: receiptUploaded,
    success,
  } as BonusClaimSubmitEvent);
}

/**
 * Track framework card interaction
 * Triggered when user opens/expands a framework card
 *
 * @param slug - Framework slug identifier
 * @param title - Framework title (optional)
 *
 * @example
 * trackFrameworkCardOpen('five-planes', 'The Five Planes')
 */
export function trackFrameworkCardOpen(slug: string, title?: string): void {
  trackEvent({
    event: 'framework_card_open',
    slug,
    title,
  } as FrameworkCardOpenEvent);
}

/**
 * Track overview section read depth
 * Triggered at scroll milestones in overview section
 *
 * @param percentage - Percentage of section read (0-100)
 *
 * @example
 * trackOverviewReadDepth(75)
 */
export function trackOverviewReadDepth(percentage: number): void {
  trackEvent({
    event: 'overview_read_depth',
    pct: percentage,
  } as OverviewReadDepthEvent);
}

/**
 * Track social proof section view
 * Triggered when social proof section enters viewport
 *
 * @param endorsementCount - Number of endorsements visible (optional)
 *
 * @example
 * trackSocialProofView(6)
 */
export function trackSocialProofView(endorsementCount?: number): void {
  trackEvent({
    event: 'social_proof_view',
    endorsement_count: endorsementCount,
  } as SocialProofViewEvent);
}

/**
 * Track endorsement expand
 * Triggered when user expands an endorsement
 *
 * @param endorsementId - Endorsement unique identifier
 *
 * @example
 * trackEndorsementExpand('endorsement-1')
 */
export function trackEndorsementExpand(endorsementId: string): void {
  trackEvent({
    event: 'endorsement_expand',
    endorsement_id: endorsementId,
  } as EndorsementExpandEvent);
}

/**
 * Track endorsement tab change
 * Triggered when user switches endorsement tabs/categories
 *
 * @param tabId - Tab identifier
 *
 * @example
 * trackEndorsementTabChange('tech-leaders')
 */
export function trackEndorsementTabChange(tabId: string): void {
  trackEvent({
    event: 'endorsement_tab_change',
    tab_id: tabId,
  } as EndorsementTabChangeEvent);
}

/**
 * Track FAQ item open
 * Triggered when user expands an FAQ question
 *
 * @param questionId - FAQ question identifier
 * @param questionPreview - First 50 chars of question (optional)
 *
 * @example
 * trackFAQOpen('faq-shipping', 'How long does shipping take?')
 */
export function trackFAQOpen(questionId: string, questionPreview?: string): void {
  trackEvent({
    event: 'faq_open',
    question_id: questionId,
    question_preview: questionPreview,
  } as FAQOpenEvent);
}

/**
 * Track press kit download
 * Triggered when user downloads press kit assets
 *
 * @param assetType - Type of asset downloaded
 * @param format - File format (optional)
 *
 * @example
 * trackPressKitDownload('full-kit', 'zip')
 */
export function trackPressKitDownload(
  assetType: 'synopsis' | 'press-release' | 'covers' | 'headshots' | 'full-kit',
  format?: string
): void {
  trackEvent({
    event: 'presskit_download',
    asset_type: assetType,
    format,
  } as PresskitDownloadEvent);
}

/**
 * Track author press kit download
 * Triggered when user downloads author bio/headshots
 *
 * @param assetType - Type of asset
 *
 * @example
 * trackAuthorPressDownload('bio')
 */
export function trackAuthorPressDownload(
  assetType?: 'bio' | 'headshots' | 'both'
): void {
  trackEvent({
    event: 'author_press_download',
    asset_type: assetType,
  } as AuthorPressDownloadEvent);
}

/**
 * Track media request submission
 * Triggered when journalist/media submits request form
 *
 * @param requestType - Type of request
 * @param success - Whether submission was successful
 * @param outletHash - Media outlet (hashed for privacy, optional)
 *
 * @example
 * trackMediaRequest('interview', true, 'abc123')
 */
export function trackMediaRequest(
  requestType: 'galley' | 'interview' | 'review-copy' | 'speaking' | 'other',
  success: boolean = true,
  outletHash?: string
): void {
  trackEvent({
    event: 'media_request_submit',
    request_type: requestType,
    success,
    outlet_hash: outletHash,
  } as MediaRequestSubmitEvent);
}

/**
 * Track bulk order interest submission
 * Triggered when corporate customer submits bulk order inquiry
 *
 * @param qtyBand - Quantity band for categorization
 * @param success - Whether submission was successful
 * @param companyHash - Company name (hashed for privacy, optional)
 *
 * @example
 * trackBulkInterest('100-500', true, 'xyz789')
 */
export function trackBulkInterest(
  qtyBand: '<50' | '50-100' | '100-500' | '500-1000' | '1000+',
  success: boolean = true,
  companyHash?: string
): void {
  trackEvent({
    event: 'bulk_interest_submit',
    qty_band: qtyBand,
    success,
    company_hash: companyHash,
  } as BulkInterestSubmitEvent);
}

/**
 * Track video play
 * Triggered when user plays video content
 *
 * @param videoId - Video identifier
 * @param videoType - Type of video
 * @param duration - Video duration in seconds (optional)
 *
 * @example
 * trackVideoPlay('trailer-main', 'trailer', 30)
 */
export function trackVideoPlay(
  videoId: string,
  videoType: 'trailer' | 'interview' | 'author-intro',
  duration?: number
): void {
  trackEvent({
    event: 'video_play',
    video_id: videoId,
    video_type: videoType,
    duration,
  } as VideoPlayEvent);
}

/**
 * Track video completion
 * Triggered when user watches video to completion
 *
 * @param videoId - Video identifier
 * @param pctWatched - Percentage watched
 *
 * @example
 * trackVideoComplete('trailer-main', 100)
 */
export function trackVideoComplete(videoId: string, pctWatched: number): void {
  trackEvent({
    event: 'video_complete',
    video_id: videoId,
    pct_watched: pctWatched,
  } as VideoCompleteEvent);
}

/**
 * Track scroll depth milestone
 * Triggered at 25%, 50%, 75%, 100% scroll milestones
 *
 * @param percentage - Percentage scrolled
 *
 * @example
 * trackScrollDepth(50)
 */
export function trackScrollDepth(percentage: 25 | 50 | 75 | 100): void {
  trackEvent({
    event: 'scroll_depth',
    pct: percentage,
  } as ScrollDepthEvent);
}

/**
 * Track anchor navigation
 * Triggered when user uses anchor links to navigate
 *
 * @param sectionId - Target section ID
 * @param source - Source of navigation
 *
 * @example
 * trackAnchorNavigation('frameworks', 'menu')
 */
export function trackAnchorNavigation(
  sectionId: string,
  source: 'menu' | 'cta' | 'footer'
): void {
  trackEvent({
    event: 'anchor_navigation',
    section_id: sectionId,
    source,
  } as AnchorNavigationEvent);
}

/**
 * Track region switcher
 * Triggered when user changes geographic region
 *
 * @param fromRegion - Previous region
 * @param toRegion - New region
 *
 * @example
 * trackRegionSwitch('US', 'UK')
 */
export function trackRegionSwitch(fromRegion: GeoRegion, toRegion: GeoRegion): void {
  trackEvent({
    event: 'region_switch',
    from_region: fromRegion,
    to_region: toRegion,
  } as RegionSwitchEvent);
}

/**
 * Track format toggle
 * Triggered when user switches book format in hero
 *
 * @param fromFormat - Previous format
 * @param toFormat - New format
 *
 * @example
 * trackFormatToggle('hardcover', 'ebook')
 */
export function trackFormatToggle(fromFormat: BookFormat, toFormat: BookFormat): void {
  trackEvent({
    event: 'format_toggle',
    from_format: fromFormat,
    to_format: toFormat,
  } as FormatToggleEvent);
}

/**
 * Track newsletter subscription
 * Triggered when user subscribes to newsletter
 *
 * @param sourceReferrer - Referrer source (optional)
 * @param success - Whether subscription was successful
 *
 * @example
 * trackNewsletterSubscribe('footer', true)
 */
export function trackNewsletterSubscribe(
  sourceReferrer?: string,
  success: boolean = true
): void {
  trackEvent({
    event: 'newsletter_subscribed',
    source_referrer: sourceReferrer,
    success,
  } as NewsletterSubscribedEvent);
}

/**
 * Track form error
 * Triggered when form validation fails
 *
 * @param formId - Form identifier
 * @param errorType - Type of error
 * @param errorField - Error field (optional)
 *
 * @example
 * trackFormError('lead-capture', 'validation', 'email')
 */
export function trackFormError(
  formId: string,
  errorType: 'validation' | 'network' | 'server' | 'rate-limit',
  errorField?: string
): void {
  trackEvent({
    event: 'form_error',
    form_id: formId,
    error_type: errorType,
    error_field: errorField,
  } as FormErrorEvent);
}

/**
 * Track API error
 * Triggered when API call fails
 *
 * @param endpoint - API endpoint
 * @param statusCode - HTTP status code (optional)
 * @param errorMessage - Error message (optional, sanitized)
 *
 * @example
 * trackAPIError('/api/lead-capture', 500, 'Internal server error')
 */
export function trackAPIError(
  endpoint: string,
  statusCode?: number,
  errorMessage?: string
): void {
  trackEvent({
    event: 'api_error',
    endpoint,
    status_code: statusCode,
    error_message: errorMessage,
  } as APIErrorEvent);
}

/**
 * Track VIP code redemption attempt
 * Triggered when user attempts to redeem a VIP code
 *
 * @param codeFormat - Code format validation result
 *
 * @example
 * trackVIPCodeRedeemAttempt('valid')
 */
export function trackVIPCodeRedeemAttempt(
  codeFormat?: 'valid' | 'invalid'
): void {
  trackEvent({
    event: 'vip_code_redeem_attempt',
    code_format: codeFormat,
  } as VIPCodeRedeemAttemptEvent);
}

/**
 * Track VIP code redemption success
 * Triggered when VIP code is successfully redeemed
 *
 * @param benefitsCount - Number of benefits unlocked
 *
 * @example
 * trackVIPCodeRedeemSuccess(6)
 */
export function trackVIPCodeRedeemSuccess(benefitsCount?: number): void {
  trackEvent({
    event: 'vip_code_redeem_success',
    benefits_count: benefitsCount,
  } as VIPCodeRedeemSuccessEvent);
}

/**
 * Track VIP code redemption failure
 * Triggered when VIP code redemption fails
 *
 * @param failureReason - Reason for failure
 *
 * @example
 * trackVIPCodeRedeemFailure('invalid_code')
 */
export function trackVIPCodeRedeemFailure(
  failureReason: 'invalid_code' | 'expired' | 'already_used' | 'server_error' | 'not_authenticated'
): void {
  trackEvent({
    event: 'vip_code_redeem_failure',
    failure_reason: failureReason,
  } as VIPCodeRedeemFailureEvent);
}

/**
 * Track experiment variant assignment
 * Triggered when a user is assigned to an A/B test variant
 *
 * @param experimentId - Experiment ID
 * @param variantId - Variant ID assigned to user
 * @param variantName - Variant name
 *
 * @example
 * trackExperimentAssigned('hero-headline', 'B', 'Scale Focus')
 */
export function trackExperimentAssigned(
  experimentId: string,
  variantId: string,
  variantName: string
): void {
  trackEvent({
    event: 'experiment_assigned',
    experiment_id: experimentId,
    variant_id: variantId,
    variant_name: variantName,
  } as ExperimentAssignedEvent);
}

/**
 * Track experiment conversion event
 * Triggered when a user completes a conversion goal within an experiment
 *
 * @param experimentId - Experiment ID
 * @param variantId - Variant ID user is assigned to
 * @param variantName - Variant name
 * @param conversionEvent - Name of the conversion event
 * @param conversionValue - Optional conversion value
 * @param metadata - Additional conversion metadata
 *
 * @example
 * trackExperimentConversion('hero-headline', 'B', 'Scale Focus', 'preorder_click', 29.99, {
 *   retailer: 'amazon',
 *   format: 'hardcover'
 * })
 */
export function trackExperimentConversion(
  experimentId: string,
  variantId: string,
  variantName: string,
  conversionEvent: string,
  conversionValue?: number,
  metadata?: Record<string, unknown>
): void {
  trackEvent({
    event: 'experiment_conversion',
    experiment_id: experimentId,
    variant_id: variantId,
    variant_name: variantName,
    conversion_event: conversionEvent,
    conversion_value: conversionValue,
    ...metadata,
  } as ExperimentConversionEvent);
}
