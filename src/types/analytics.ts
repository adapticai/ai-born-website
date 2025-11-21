/**
 * Google Tag Manager (GTM) dataLayer event types
 * Based on CLAUDE.md Section 9: Analytics & Tracking
 */

import { type BookFormat, type GeoRegion } from './index';

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
  origin_section: 'hero' | 'footer' | 'bonus' | 'header' | 'mobile-header' | 'pricing-table' | 'bonus-pack-hero' | 'bonus-pack-cta';
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
  /** Book format (hardcover, ebook, audiobook) */
  format?: string;
  /** Hashed order ID for privacy */
  order_id_hash: string;
  /** Whether file was uploaded */
  receipt_uploaded: boolean;
  /** Whether submission was successful */
  success?: boolean;
}

/**
 * Triggered when user selects a file for bonus claim
 */
export interface BonusClaimFileSelectEvent extends BaseAnalyticsEvent {
  event: 'bonus_claim_file_select';
  /** File type/MIME type */
  file_type: string;
  /** File size in bytes */
  file_size: number;
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
  /** Number of assets in download */
  asset_count?: number;
  /** Generation time in milliseconds */
  generation_time_ms?: number;
  /** User agent string */
  user_agent?: string;
  /** Whether user is authenticated */
  authenticated?: boolean;
  /** User email (if authenticated) */
  user_email?: string;
  /** User name (if authenticated) */
  user_name?: string;
}

/**
 * Press kit download error event
 * Triggered when press kit download fails
 */
export interface PresskitDownloadErrorEvent extends BaseAnalyticsEvent {
  event: 'presskit_download_error';
  /** Error message */
  error_message: string;
  /** Error code */
  error_code?: string;
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

// ==================== VIP Code Redemption Events ====================

/**
 * VIP code redemption attempt event
 * Triggered when user attempts to redeem a VIP code
 */
export interface VIPCodeRedeemAttemptEvent extends BaseAnalyticsEvent {
  event: 'vip_code_redeem_attempt';
  /** Code format (for analytics, not actual code) */
  code_format?: 'valid' | 'invalid';
}

/**
 * VIP code redemption success event
 * Triggered when VIP code is successfully redeemed
 */
export interface VIPCodeRedeemSuccessEvent extends BaseAnalyticsEvent {
  event: 'vip_code_redeem_success';
  /** Benefits unlocked (optional) */
  benefits_count?: number;
}

/**
 * VIP code redemption failure event
 * Triggered when VIP code redemption fails
 */
export interface VIPCodeRedeemFailureEvent extends BaseAnalyticsEvent {
  event: 'vip_code_redeem_failure';
  /** Failure reason */
  failure_reason: 'invalid_code' | 'expired' | 'already_used' | 'server_error' | 'not_authenticated';
}

// ==================== Authentication Events ====================

/**
 * Sign in event
 * Triggered when user attempts to sign in
 */
export interface SignInEvent extends BaseAnalyticsEvent {
  event: 'sign_in';
  /** Authentication provider */
  provider: 'google' | 'github' | 'email' | 'credentials';
  /** Whether sign-in was successful */
  success: boolean;
  /** Error message if sign-in failed (sanitized) */
  error_message?: string;
  /** Whether this is a new user */
  is_new_user?: boolean;
}

/**
 * Sign up event
 * Triggered when user completes registration
 */
export interface SignUpEvent extends BaseAnalyticsEvent {
  event: 'sign_up';
  /** Authentication provider used for sign-up */
  provider: 'google' | 'github' | 'email' | 'credentials';
  /** Whether sign-up was successful */
  success: boolean;
}

/**
 * Sign out event
 * Triggered when user signs out
 */
export interface SignOutEvent extends BaseAnalyticsEvent {
  event: 'sign_out';
  /** User ID (hashed for privacy) */
  user_id?: string;
  /** Session duration in seconds */
  session_duration?: number;
}

/**
 * Auth error event
 * Triggered when authentication error occurs
 */
export interface AuthErrorEvent extends BaseAnalyticsEvent {
  event: 'auth_error';
  /** Type of authentication error */
  error_type: 'sign_in_failed' | 'sign_up_failed' | 'session_expired' | 'invalid_credentials' | 'provider_error' | 'network_error' | 'unknown';
  /** Page where error occurred */
  page: string;
  /** Error message (sanitized) */
  error_message?: string;
  /** Provider that caused the error */
  provider?: 'google' | 'github' | 'email' | 'credentials';
}

/**
 * Auth button click event
 * Triggered when user clicks authentication button
 */
export interface AuthButtonClickEvent extends BaseAnalyticsEvent {
  event: 'auth_button_click';
  /** Button action */
  action: 'sign_in' | 'sign_up' | 'sign_out';
  /** Authentication provider */
  provider: 'google' | 'github' | 'email' | 'credentials' | 'default';
  /** Page where button was clicked */
  page: string;
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
  error_type: 'validation' | 'network' | 'server' | 'rate-limit' | 'unknown';
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

// ==================== A/B Testing Events ====================

/**
 * Experiment assignment event
 * Triggered when a user is assigned to a variant
 */
export interface ExperimentAssignedEvent extends BaseAnalyticsEvent {
  event: 'experiment_assigned';
  /** Experiment ID */
  experiment_id: string;
  /** Variant ID assigned to user */
  variant_id: string;
  /** Variant name */
  variant_name: string;
}

/**
 * Experiment conversion event
 * Triggered when a user completes a conversion goal within an experiment
 */
export interface ExperimentConversionEvent extends BaseAnalyticsEvent {
  event: 'experiment_conversion';
  /** Experiment ID */
  experiment_id: string;
  /** Variant ID user is assigned to */
  variant_id: string;
  /** Variant name */
  variant_name: string;
  /** Name of the conversion event */
  conversion_event: string;
  /** Optional conversion value */
  conversion_value?: number;
  /** Additional conversion metadata */
  [key: string]: unknown;
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
  | BonusClaimFileSelectEvent
  | FrameworkCardOpenEvent
  | OverviewReadDepthEvent
  | SocialProofViewEvent
  | EndorsementExpandEvent
  | EndorsementTabChangeEvent
  | FAQOpenEvent
  | PresskitDownloadEvent
  | PresskitDownloadErrorEvent
  | AuthorPressDownloadEvent
  | MediaRequestSubmitEvent
  | BulkInterestSubmitEvent
  | VideoPlayEvent
  | VideoCompleteEvent
  | ScrollDepthEvent
  | AnchorNavigationEvent
  | RegionSwitchEvent
  | FormatToggleEvent
  | VIPCodeRedeemAttemptEvent
  | VIPCodeRedeemSuccessEvent
  | VIPCodeRedeemFailureEvent
  | SignInEvent
  | SignUpEvent
  | SignOutEvent
  | AuthErrorEvent
  | AuthButtonClickEvent
  | FormErrorEvent
  | APIErrorEvent
  | ExperimentAssignedEvent
  | ExperimentConversionEvent;

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
