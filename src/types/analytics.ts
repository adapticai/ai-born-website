/**
 * Google Tag Manager (GTM) dataLayer event types
 * Based on CLAUDE.md Section 9: Analytics & Tracking
 */

import { BookFormat, GeoRegion } from './index';

// ==================== Base Event Structure ====================

/**
 * Base interface for all GTM dataLayer events
 */
interface BaseAnalyticsEvent {
  event: string;
  /** Book identifier */
  book?: 'ai-born';
  /** Campaign identifier for attribution */
  campaign?: string;
  /** Timestamp of event (ISO 8601) */
  timestamp?: string;
}

// ==================== Hero Section Events ====================

/**
 * Hero CTA click event
 * Triggered when user clicks primary CTAs in hero section
 */
export interface HeroCTAClickEvent extends BaseAnalyticsEvent {
  event: 'hero_cta_click';
  /** Which CTA was clicked */
  cta_id: 'preorder' | 'excerpt';
  /** Selected book format */
  format: BookFormat;
  /** Selected retailer (if preorder) */
  retailer?: string;
  /** Geographic region */
  geo: GeoRegion;
}

/**
 * Retailer menu interaction event
 * Triggered when user opens retailer selection menu
 */
export interface RetailerMenuOpenEvent extends BaseAnalyticsEvent {
  event: 'retailer_menu_open';
  /** Where the menu was opened from */
  origin_section: 'hero' | 'footer' | 'bonus';
}

/**
 * Pre-order click event (conversion)
 * Triggered when user clicks through to retailer
 */
export interface PreorderClickEvent extends BaseAnalyticsEvent {
  event: 'preorder_click';
  /** Retailer name */
  retailer: string;
  /** Book format */
  format: BookFormat;
  /** Geographic region */
  geo: GeoRegion;
}

// ==================== Lead Capture Events ====================

/**
 * Lead capture form submission
 * Triggered when user submits email for excerpt or newsletter
 */
export interface LeadCaptureSubmitEvent extends BaseAnalyticsEvent {
  event: 'lead_capture_submit';
  /** Source of lead capture */
  source: 'hero-excerpt' | 'bonus-section' | 'newsletter-footer' | 'popup';
  /** Whether form submission was successful */
  success?: boolean;
}

/**
 * Newsletter subscription event
 * Triggered when user subscribes to newsletter
 */
export interface NewsletterSubscribedEvent extends BaseAnalyticsEvent {
  event: 'newsletter_subscribed';
  /** Referrer source */
  source_referrer?: string;
  /** Whether form submission was successful */
  success?: boolean;
}

// ==================== Bonus Claim Events ====================

/**
 * Bonus claim submission event
 * Triggered when user submits proof of purchase for bonus
 */
export interface BonusClaimSubmitEvent extends BaseAnalyticsEvent {
  event: 'bonus_claim_submit';
  /** Retailer where purchase was made */
  retailer: string;
  /** Hashed order ID for privacy */
  order_id_hash: string;
  /** Whether file was uploaded */
  receipt_uploaded: boolean;
  /** Whether submission was successful */
  success?: boolean;
}

// ==================== Content Engagement Events ====================

/**
 * Framework card interaction event
 * Triggered when user opens/expands a framework card
 */
export interface FrameworkCardOpenEvent extends BaseAnalyticsEvent {
  event: 'framework_card_open';
  /** Framework slug identifier */
  slug: string;
  /** Framework title */
  title?: string;
}

/**
 * Overview section read depth
 * Triggered at scroll milestones in overview section
 */
export interface OverviewReadDepthEvent extends BaseAnalyticsEvent {
  event: 'overview_read_depth';
  /** Percentage of section read (0-100) */
  pct: number;
}

/**
 * Social proof view event
 * Triggered when social proof section enters viewport
 */
export interface SocialProofViewEvent extends BaseAnalyticsEvent {
  event: 'social_proof_view';
  /** Number of endorsements visible */
  endorsement_count?: number;
}

/**
 * Endorsement expand event
 * Triggered when user expands an endorsement
 */
export interface EndorsementExpandEvent extends BaseAnalyticsEvent {
  event: 'endorsement_expand';
  /** Endorsement unique identifier */
  endorsement_id: string;
}

/**
 * Endorsement tab change event
 * Triggered when user switches endorsement tabs/categories
 */
export interface EndorsementTabChangeEvent extends BaseAnalyticsEvent {
  event: 'endorsement_tab_change';
  /** Tab identifier */
  tab_id: string;
}

// ==================== FAQ Events ====================

/**
 * FAQ item open event
 * Triggered when user expands an FAQ question
 */
export interface FAQOpenEvent extends BaseAnalyticsEvent {
  event: 'faq_open';
  /** FAQ question identifier */
  question_id: string;
  /** FAQ question text (first 50 chars) */
  question_preview?: string;
}

// ==================== Media & Press Events ====================

/**
 * Press kit download event
 * Triggered when user downloads press kit assets
 */
export interface PresskitDownloadEvent extends BaseAnalyticsEvent {
  event: 'presskit_download';
  /** Type of asset downloaded */
  asset_type: 'synopsis' | 'press-release' | 'covers' | 'headshots' | 'full-kit';
  /** File format */
  format?: string;
}

/**
 * Author press kit download event
 * Triggered when user downloads author bio/headshots
 */
export interface AuthorPressDownloadEvent extends BaseAnalyticsEvent {
  event: 'author_press_download';
  /** Type of asset */
  asset_type?: 'bio' | 'headshots' | 'both';
}

/**
 * Media request submission event
 * Triggered when journalist/media submits request form
 */
export interface MediaRequestSubmitEvent extends BaseAnalyticsEvent {
  event: 'media_request_submit';
  /** Type of request */
  request_type: 'galley' | 'interview' | 'review-copy' | 'speaking' | 'other';
  /** Media outlet (hashed for privacy) */
  outlet_hash?: string;
  /** Whether submission was successful */
  success?: boolean;
}

// ==================== Bulk Order Events ====================

/**
 * Bulk order interest submission
 * Triggered when corporate customer submits bulk order inquiry
 */
export interface BulkInterestSubmitEvent extends BaseAnalyticsEvent {
  event: 'bulk_interest_submit';
  /** Quantity band for categorization */
  qty_band: '<50' | '50-100' | '100-500' | '500-1000' | '1000+';
  /** Company name (hashed for privacy) */
  company_hash?: string;
  /** Whether submission was successful */
  success?: boolean;
}

// ==================== Video & Media Events ====================

/**
 * Video play event
 * Triggered when user plays video content (trailer, etc.)
 */
export interface VideoPlayEvent extends BaseAnalyticsEvent {
  event: 'video_play';
  /** Video identifier */
  video_id: string;
  /** Video type */
  video_type: 'trailer' | 'interview' | 'author-intro';
  /** Video duration in seconds */
  duration?: number;
}

/**
 * Video completion event
 * Triggered when user watches video to completion
 */
export interface VideoCompleteEvent extends BaseAnalyticsEvent {
  event: 'video_complete';
  /** Video identifier */
  video_id: string;
  /** Percentage watched */
  pct_watched: number;
}

// ==================== Navigation & UX Events ====================

/**
 * Scroll depth tracking event
 * Triggered at 25%, 50%, 75%, 100% scroll milestones
 */
export interface ScrollDepthEvent extends BaseAnalyticsEvent {
  event: 'scroll_depth';
  /** Percentage scrolled */
  pct: 25 | 50 | 75 | 100;
}

/**
 * Anchor navigation event
 * Triggered when user uses anchor links to navigate
 */
export interface AnchorNavigationEvent extends BaseAnalyticsEvent {
  event: 'anchor_navigation';
  /** Target section ID */
  section_id: string;
  /** Source of navigation */
  source: 'menu' | 'cta' | 'footer';
}

/**
 * Region switcher event
 * Triggered when user changes geographic region
 */
export interface RegionSwitchEvent extends BaseAnalyticsEvent {
  event: 'region_switch';
  /** Previous region */
  from_region: GeoRegion;
  /** New region */
  to_region: GeoRegion;
}

/**
 * Format toggle event
 * Triggered when user switches book format in hero
 */
export interface FormatToggleEvent extends BaseAnalyticsEvent {
  event: 'format_toggle';
  /** Previous format */
  from_format: BookFormat;
  /** New format */
  to_format: BookFormat;
}

// ==================== Error Events ====================

/**
 * Form error event
 * Triggered when form validation fails
 */
export interface FormErrorEvent extends BaseAnalyticsEvent {
  event: 'form_error';
  /** Form identifier */
  form_id: string;
  /** Error type */
  error_type: 'validation' | 'network' | 'server' | 'rate-limit';
  /** Error field (if applicable) */
  error_field?: string;
}

/**
 * API error event
 * Triggered when API call fails
 */
export interface APIErrorEvent extends BaseAnalyticsEvent {
  event: 'api_error';
  /** API endpoint */
  endpoint: string;
  /** HTTP status code */
  status_code?: number;
  /** Error message (sanitized) */
  error_message?: string;
}

// ==================== Union Type for All Events ====================

/**
 * Union type of all possible analytics events
 * Use for type-safe event tracking functions
 */
export type AnalyticsEvent =
  | HeroCTAClickEvent
  | RetailerMenuOpenEvent
  | PreorderClickEvent
  | LeadCaptureSubmitEvent
  | NewsletterSubscribedEvent
  | BonusClaimSubmitEvent
  | FrameworkCardOpenEvent
  | OverviewReadDepthEvent
  | SocialProofViewEvent
  | EndorsementExpandEvent
  | EndorsementTabChangeEvent
  | FAQOpenEvent
  | PresskitDownloadEvent
  | AuthorPressDownloadEvent
  | MediaRequestSubmitEvent
  | BulkInterestSubmitEvent
  | VideoPlayEvent
  | VideoCompleteEvent
  | ScrollDepthEvent
  | AnchorNavigationEvent
  | RegionSwitchEvent
  | FormatToggleEvent
  | FormErrorEvent
  | APIErrorEvent;

// ==================== Helper Types ====================

/**
 * Extract event name from event type
 */
export type EventName = AnalyticsEvent['event'];

/**
 * GTM dataLayer array type
 */
export type GTMDataLayer = Array<AnalyticsEvent | Record<string, unknown>>;

/**
 * Window interface extension for dataLayer
 */
declare global {
  interface Window {
    dataLayer: GTMDataLayer;
  }
}
