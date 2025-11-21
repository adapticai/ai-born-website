/**
 * Retailer Data & URL Building Utilities
 */

import type { Retailer, GeoRegion, BookFormat, UTMParams } from '@/types';

/**
 * Complete retailer data with geo-availability and format support
 */
export const retailerData: Record<string, Retailer> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    logo: '/images/retailers/amazon.svg',
    url: 'https://www.amazon.com/dp/[ISBN]',
    geoAvailability: ['US', 'UK', 'EU', 'AU'],
    formats: ['hardcover', 'paperback', 'ebook', 'audiobook', 'bundle-hardcover', 'bundle-paperback'],
    priority: 1,
  },
  barnesnoble: {
    id: 'barnesnoble',
    name: 'Barnes & Noble',
    logo: '/images/retailers/barnesnoble.svg',
    url: 'https://www.barnesandnoble.com/w/[TITLE]/[BN_ID]',
    geoAvailability: ['US'],
    formats: ['hardcover', 'paperback', 'ebook', 'audiobook', 'bundle-hardcover', 'bundle-paperback'],
    priority: 2,
  },
  bookshop: {
    id: 'bookshop',
    name: 'Bookshop.org',
    logo: '/images/retailers/bookshop.svg',
    url: 'https://bookshop.org/books/[SLUG]',
    geoAvailability: ['US', 'UK'],
    formats: ['hardcover', 'paperback'],
    priority: 4,
  },
  applebooks: {
    id: 'applebooks',
    name: 'Apple Books',
    logo: '/images/retailers/applebooks.svg',
    url: 'https://books.apple.com/us/book/[SLUG]/[APPLE_ID]',
    geoAvailability: ['US', 'UK', 'EU', 'AU'],
    formats: ['ebook', 'audiobook'],
    priority: 5,
  },
  googleplay: {
    id: 'googleplay',
    name: 'Google Play',
    logo: '/images/retailers/googleplay.svg',
    url: 'https://play.google.com/store/books/details/[GOOGLE_ID]',
    geoAvailability: ['US', 'UK', 'EU', 'AU'],
    formats: ['ebook', 'audiobook'],
    priority: 6,
  },
  kobo: {
    id: 'kobo',
    name: 'Kobo',
    logo: '/images/retailers/kobo.svg',
    url: 'https://www.kobo.com/us/en/ebook/[SLUG]',
    geoAvailability: ['US', 'UK', 'EU', 'AU'],
    formats: ['ebook'],
    priority: 7,
  },
  walmart: {
    id: 'walmart',
    name: 'Walmart',
    logo: '/images/retailers/walmart.svg',
    url: 'https://www.walmart.com/ip/[WALMART_ID]',
    geoAvailability: ['US'],
    formats: ['hardcover', 'ebook'],
    priority: 3,
  },
  target: {
    id: 'target',
    name: 'Target',
    logo: '/images/retailers/target.svg',
    url: 'https://www.target.com/p/[TARGET_ID]',
    geoAvailability: ['US'],
    formats: ['hardcover', 'ebook'],
    priority: 4,
  },
  audible: {
    id: 'audible',
    name: 'Audible',
    logo: '/images/retailers/audible.svg',
    url: 'https://www.audible.com/pd/[ASIN]',
    geoAvailability: ['US', 'UK', 'AU'],
    formats: ['audiobook'],
    priority: 8,
  },
};

/**
 * Retailer-specific URL templates by format
 * Update these with actual book IDs when available
 */
const retailerURLTemplates: Record<string, Partial<Record<BookFormat, string>>> = {
  amazon: {
    hardcover: 'https://www.amazon.com/dp/[ISBN_HARDCOVER]',
    paperback: 'https://www.amazon.com/dp/[ISBN_PAPERBACK]',
    ebook: 'https://www.amazon.com/dp/[KINDLE_ASIN]',
    audiobook: 'https://www.audible.com/pd/[AUDIBLE_ASIN]',
    'bundle-hardcover': 'https://www.amazon.com/dp/[ISBN_HARDCOVER]',
    'bundle-paperback': 'https://www.amazon.com/dp/[ISBN_PAPERBACK]',
  },
  barnesnoble: {
    hardcover: 'https://www.barnesandnoble.com/w/[BN_ID]',
    paperback: 'https://www.barnesandnoble.com/w/[BN_ID_PAPERBACK]',
    ebook: 'https://www.barnesandnoble.com/w/[BN_ID]',
    audiobook: 'https://www.barnesandnoble.com/w/[BN_ID]',
    'bundle-hardcover': 'https://www.barnesandnoble.com/w/[BN_ID]',
    'bundle-paperback': 'https://www.barnesandnoble.com/w/[BN_ID_PAPERBACK]',
  },
  bookshop: {
    hardcover: 'https://bookshop.org/books/ai-born/[BOOKSHOP_ID]',
    paperback: 'https://bookshop.org/books/ai-born/[BOOKSHOP_ID_PAPERBACK]',
  },
  applebooks: {
    ebook: 'https://books.apple.com/us/book/ai-born/[APPLE_ID]',
    audiobook: 'https://books.apple.com/us/audiobook/ai-born/[APPLE_AUDIO_ID]',
  },
  googleplay: {
    ebook: 'https://play.google.com/store/books/details?id=[GOOGLE_ID]',
    audiobook: 'https://play.google.com/store/audiobooks/details?id=[GOOGLE_AUDIO_ID]',
  },
  kobo: {
    ebook: 'https://www.kobo.com/us/en/ebook/ai-born',
  },
  walmart: {
    hardcover: 'https://www.walmart.com/ip/[WALMART_ID_HARDCOVER]',
    ebook: 'https://www.walmart.com/ip/[WALMART_ID_EBOOK]',
  },
  target: {
    hardcover: 'https://www.target.com/p/[TARGET_ID_HARDCOVER]',
    ebook: 'https://www.target.com/p/[TARGET_ID_EBOOK]',
  },
  audible: {
    audiobook: 'https://www.audible.com/pd/[AUDIBLE_ASIN]',
  },
};

/**
 * Build UTM parameters for tracking
 */
export function buildUTMParams(params?: Partial<UTMParams>): UTMParams {
  const defaults: UTMParams = {
    source: 'website',
    medium: 'referral',
    campaign: 'ai-born-launch',
  };

  return {
    ...defaults,
    ...params,
  };
}

/**
 * Convert UTM params object to URL query string
 */
export function utmParamsToString(params: UTMParams): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      const paramKey = key.startsWith('utm_') ? key : `utm_${key}`;
      return `${paramKey}=${encodeURIComponent(value as string)}`;
    });

  return entries.join('&');
}

/**
 * Get retailer URL with UTM tracking
 */
export function getRetailerUrl(
  retailerId: string,
  format: BookFormat,
  utmParams?: UTMParams
): string {
  const template = retailerURLTemplates[retailerId]?.[format];
  
  if (!template) {
    console.warn(`No URL template for ${retailerId} - ${format}`);
    return '#';
  }

  let url = template;
  const utm = utmParams || buildUTMParams({ content: `${retailerId}-${format}` });
  const utmString = utmParamsToString(utm);

  if (utmString) {
    const separator = url.includes('?') ? '&' : '?';
    url += separator + utmString;
  }

  return url;
}

/**
 * Get retailers available for a specific geo region
 */
export function getRetailersByGeo(region: GeoRegion): Retailer[] {
  return Object.values(retailerData)
    .filter((retailer) => retailer.geoAvailability.includes(region))
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

/**
 * Get default retailers for a geo region (top 3-4)
 */
export function getDefaultRetailers(region: GeoRegion): Retailer[] {
  const retailers = getRetailersByGeo(region);
  return retailers.slice(0, 4);
}

/**
 * Get retailers by format availability
 */
export function getRetailersByFormat(
  format: BookFormat,
  region?: GeoRegion
): Retailer[] {
  let retailers = Object.values(retailerData).filter((retailer) =>
    retailer.formats.includes(format)
  );

  if (region) {
    retailers = retailers.filter((retailer) =>
      retailer.geoAvailability.includes(region)
    );
  }

  return retailers.sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

/**
 * Get a single retailer by ID
 */
export function getRetailerById(retailerId: string): Retailer | undefined {
  return retailerData[retailerId];
}

/**
 * Get all available formats across all retailers
 */
export function getAllFormats(): BookFormat[] {
  return ['hardcover', 'paperback', 'ebook', 'audiobook', 'bundle-hardcover', 'bundle-paperback'];
}

/**
 * Get individual formats (not bundles)
 */
export function getIndividualFormats(): BookFormat[] {
  return ['hardcover', 'paperback', 'ebook', 'audiobook'];
}

/**
 * Get bundle formats
 */
export function getBundleFormats(): BookFormat[] {
  return ['bundle-hardcover', 'bundle-paperback'];
}

/**
 * Format display name for book format
 */
export function formatDisplayName(format: BookFormat): string {
  const displayNames: Record<BookFormat, string> = {
    hardcover: 'Hardcover',
    paperback: 'Paperback',
    ebook: 'eBook',
    audiobook: 'Audiobook',
    'bundle-hardcover': 'Complete Bundle (Hardcover)',
    'bundle-paperback': 'Complete Bundle (Paperback)',
  };

  return displayNames[format] || format;
}

/**
 * Get bundle description
 */
export function getBundleDescription(format: BookFormat): string {
  const descriptions: Partial<Record<BookFormat, string>> = {
    'bundle-hardcover': 'Hardcover + eBook + Audiobook',
    'bundle-paperback': 'Paperback + eBook + Audiobook',
  };

  return descriptions[format] || '';
}

/**
 * Check if format is a bundle
 */
export function isBundle(format: BookFormat): boolean {
  return format.startsWith('bundle-');
}

/**
 * Check if a retailer supports a specific format
 */
export function retailerSupportsFormat(
  retailerId: string,
  format: BookFormat
): boolean {
  const retailer = retailerData[retailerId];
  return retailer ? retailer.formats.includes(format) : false;
}

/**
 * Get retailer display info for UI
 */
export function getRetailerDisplayInfo(retailerId: string): {
  name: string;
  logo: string;
  available: boolean;
} {
  const retailer = retailerData[retailerId];
  
  return {
    name: retailer?.name || retailerId,
    logo: retailer?.logo || '/images/retailers/default.svg',
    available: !!retailer,
  };
}
