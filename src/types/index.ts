/**
 * Core Type Definitions for AI-Born Landing Page
 */

// ============================================================================
// Geographic & Localization Types
// ============================================================================

export type GeoRegion = 'US' | 'UK' | 'EU' | 'AU';

// ============================================================================
// Book & Product Types
// ============================================================================

export type BookFormat =
  | 'hardcover'
  | 'paperback'
  | 'ebook'
  | 'audiobook'
  | 'bundle-hardcover'
  | 'bundle-paperback';

export interface FormatPrice {
  US: number;
  UK: number;
  EU: number;
  AU: number;
}

export interface BundleOption {
  id: string;
  name: string;
  formats: BookFormat[];
  description: string;
  savings?: string;
}

export interface Book {
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  isbn?: string;
  formats: BookFormat[];
  releaseDate?: string;
  description: string;
}

// ============================================================================
// Retailer Types
// ============================================================================

export interface Retailer {
  id: string;
  name: string;
  logo?: string;
  url: string;
  geoAvailability: GeoRegion[];
  formats: BookFormat[];
  priority?: number;
}

export interface RetailerLink {
  retailer: string;
  format: BookFormat;
  url: string;
  utm?: UTMParams;
}

// ============================================================================
// UTM & Analytics Types
// ============================================================================

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

// ============================================================================
// Endorsement & Social Proof Types
// ============================================================================

export interface Endorsement {
  id: string;
  quote: string;
  name: string;
  title: string;
  affiliation?: string;
  featured: boolean;
  category?: string;
  avatarUrl?: string;
}

// ============================================================================
// Framework Types
// ============================================================================

export interface Framework {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
}

// ============================================================================
// FAQ Types
// ============================================================================

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

// ============================================================================
// Media Kit Types
// ============================================================================

export interface MediaAsset {
  type: 'synopsis' | 'pressRelease' | 'cover' | 'headshot' | 'chapter' | 'excerpt' | 'interview';
  title: string;
  description?: string;
  url: string;
  format: string;
  fileSize?: string;
  thumbnail?: string;
}

export interface MediaKit {
  synopsis?: MediaAsset;
  pressRelease?: MediaAsset;
  covers: MediaAsset[];
  headshots: MediaAsset[];
  chapters?: MediaAsset;
  excerpts?: MediaAsset[];
  interviewTopics?: MediaAsset;
}

// ============================================================================
// Re-export Analytics Types from analytics.ts
// ============================================================================

export * from './analytics';

// ============================================================================
// Re-export Form Types from forms.ts
// ============================================================================

export * from './forms';


// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}
