/**
 * Geographic Detection & Localization Utilities
 */

import { isBrowser, safeLocalStorage } from './utils';

import type { GeoRegion } from '@/types';

const GEO_STORAGE_KEY = 'ai-born-geo-preference';

/**
 * Detect user's geographic region based on timezone and locale
 * Returns default 'US' if unable to determine or on server
 * 
 * @returns Detected geographic region
 */
export function detectUserGeo(): GeoRegion {
  if (!isBrowser()) {
    return 'US'; // Default to US on server
  }

  // Check if user has manually set preference
  const stored = safeLocalStorage.getItem(GEO_STORAGE_KEY);
  if (stored && isValidGeoRegion(stored)) {
    return stored as GeoRegion;
  }

  try {
    // Detect based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // UK timezones
    if (timezone.includes('London') || timezone.includes('Europe/London')) {
      return 'UK';
    }
    
    // EU timezones (common ones)
    if (
      timezone.includes('Europe/') &&
      !timezone.includes('London')
    ) {
      return 'EU';
    }
    
    // Australia timezones
    if (timezone.includes('Australia/')) {
      return 'AU';
    }
    
    // US timezones (and Americas as default)
    if (
      timezone.includes('America/') ||
      timezone.includes('US/') ||
      timezone.includes('Pacific') ||
      timezone.includes('Mountain') ||
      timezone.includes('Central') ||
      timezone.includes('Eastern')
    ) {
      return 'US';
    }

    // Fallback: Check locale
    const locale = navigator.language || 'en-US';
    
    if (locale.startsWith('en-GB')) return 'UK';
    if (locale.startsWith('en-AU')) return 'AU';
    if (locale.startsWith('en-US') || locale.startsWith('en-CA')) return 'US';
    
    // Check for European locales
    const europeanLocales = [
      'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ro', 'sv',
      'da', 'fi', 'no', 'cs', 'el', 'hu', 'sk', 'bg', 'hr'
    ];
    
    if (europeanLocales.some(prefix => locale.startsWith(prefix))) {
      return 'EU';
    }

  } catch (error) {
    console.error('Error detecting geo:', error);
  }

  // Default fallback
  return 'US';
}

/**
 * Check if a string is a valid GeoRegion
 */
function isValidGeoRegion(region: string): boolean {
  return ['US', 'UK', 'EU', 'AU'].includes(region);
}

/**
 * Save user's geo preference to localStorage
 * 
 * @param region - Geographic region to save
 * @returns Success boolean
 */
export function saveGeoPreference(region: GeoRegion): boolean {
  return safeLocalStorage.setItem(GEO_STORAGE_KEY, region);
}

/**
 * Get stored geo preference from localStorage
 * 
 * @returns Stored region or null if not found
 */
export function getGeoPreference(): GeoRegion | null {
  const stored = safeLocalStorage.getItem(GEO_STORAGE_KEY);
  if (stored && isValidGeoRegion(stored)) {
    return stored as GeoRegion;
  }
  return null;
}

/**
 * Clear geo preference from localStorage
 * 
 * @returns Success boolean
 */
export function clearGeoPreference(): boolean {
  return safeLocalStorage.removeItem(GEO_STORAGE_KEY);
}

/**
 * Get region-specific currency symbol
 * 
 * @param region - Geographic region
 * @returns Currency symbol
 */
export function getRegionCurrency(region: GeoRegion): string {
  const currencyMap: Record<GeoRegion, string> = {
    US: '$',
    UK: '£',
    EU: '€',
    AU: 'A$',
  };
  
  return currencyMap[region] || '$';
}

/**
 * Get region-specific currency code
 * 
 * @param region - Geographic region
 * @returns Currency code (ISO 4217)
 */
export function getRegionCurrencyCode(region: GeoRegion): string {
  const currencyCodeMap: Record<GeoRegion, string> = {
    US: 'USD',
    UK: 'GBP',
    EU: 'EUR',
    AU: 'AUD',
  };
  
  return currencyCodeMap[region] || 'USD';
}

/**
 * Get region display name
 * 
 * @param region - Geographic region
 * @returns Friendly display name
 */
export function getRegionDisplayName(region: GeoRegion): string {
  const displayNames: Record<GeoRegion, string> = {
    US: 'United States',
    UK: 'United Kingdom',
    EU: 'European Union',
    AU: 'Australia',
  };
  
  return displayNames[region] || region;
}

/**
 * Get all available regions
 * 
 * @returns Array of all geo regions
 */
export function getAllRegions(): GeoRegion[] {
  return ['US', 'UK', 'EU', 'AU'];
}

/**
 * Format price for region
 * 
 * @param amount - Price amount
 * @param region - Geographic region
 * @returns Formatted price string
 */
export function formatPrice(amount: number, region: GeoRegion): string {
  const currency = getRegionCurrencyCode(region);
  const locale = {
    US: 'en-US',
    UK: 'en-GB',
    EU: 'en-EU',
    AU: 'en-AU',
  }[region];

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    // Fallback to simple formatting
    const symbol = getRegionCurrency(region);
    return symbol + amount.toFixed(2);
  }
}
