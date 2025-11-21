/**
 * Pricing Data & Utilities
 */

import { formatPrice } from './geo';

import type { BookFormat, FormatPrice, GeoRegion } from '@/types';

/**
 * Base prices for each format across all regions
 * Prices are approximate and should be updated with actual retail prices
 */
export const formatPricing: Record<BookFormat, FormatPrice> = {
  hardcover: {
    US: 32.00,
    UK: 25.00,
    EU: 30.00,
    AU: 45.00,
  },
  paperback: {
    US: 18.00,
    UK: 14.00,
    EU: 17.00,
    AU: 25.00,
  },
  ebook: {
    US: 14.99,
    UK: 11.99,
    EU: 13.99,
    AU: 19.99,
  },
  audiobook: {
    US: 24.99,
    UK: 19.99,
    EU: 22.99,
    AU: 32.99,
  },
  'bundle-hardcover': {
    US: 59.99,
    UK: 47.99,
    EU: 54.99,
    AU: 79.99,
  },
  'bundle-paperback': {
    US: 49.99,
    UK: 39.99,
    EU: 45.99,
    AU: 65.99,
  },
};

/**
 * Get price for a specific format and region
 *
 * @param format - Book format
 * @param region - Geographic region
 * @returns Price amount
 */
export function getFormatPrice(format: BookFormat, region: GeoRegion): number {
  return formatPricing[format]?.[region] || 0;
}

/**
 * Get formatted price string for a format and region
 *
 * @param format - Book format
 * @param region - Geographic region
 * @returns Formatted price string with currency symbol
 */
export function getFormattedPrice(format: BookFormat, region: GeoRegion): string {
  const price = getFormatPrice(format, region);
  return formatPrice(price, region);
}

/**
 * Calculate bundle savings
 *
 * @param bundleFormat - Bundle format type
 * @param region - Geographic region
 * @returns Savings amount
 */
export function getBundleSavings(
  bundleFormat: 'bundle-hardcover' | 'bundle-paperback',
  region: GeoRegion
): number {
  const baseFormat = bundleFormat === 'bundle-hardcover' ? 'hardcover' : 'paperback';

  const individualTotal =
    getFormatPrice(baseFormat, region) +
    getFormatPrice('ebook', region) +
    getFormatPrice('audiobook', region);

  const bundlePrice = getFormatPrice(bundleFormat, region);

  return individualTotal - bundlePrice;
}

/**
 * Get formatted bundle savings
 *
 * @param bundleFormat - Bundle format type
 * @param region - Geographic region
 * @returns Formatted savings string
 */
export function getFormattedBundleSavings(
  bundleFormat: 'bundle-hardcover' | 'bundle-paperback',
  region: GeoRegion
): string {
  const savings = getBundleSavings(bundleFormat, region);
  return formatPrice(savings, region);
}

/**
 * Calculate savings percentage for bundles
 *
 * @param bundleFormat - Bundle format type
 * @param region - Geographic region
 * @returns Savings percentage
 */
export function getBundleSavingsPercentage(
  bundleFormat: 'bundle-hardcover' | 'bundle-paperback',
  region: GeoRegion
): number {
  const baseFormat = bundleFormat === 'bundle-hardcover' ? 'hardcover' : 'paperback';

  const individualTotal =
    getFormatPrice(baseFormat, region) +
    getFormatPrice('ebook', region) +
    getFormatPrice('audiobook', region);

  const bundlePrice = getFormatPrice(bundleFormat, region);
  const savings = individualTotal - bundlePrice;

  return Math.round((savings / individualTotal) * 100);
}
