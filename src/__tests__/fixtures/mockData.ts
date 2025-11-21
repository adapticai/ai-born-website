/**
 * Mock Data for Testing
 *
 * Provides reusable mock data for unit and integration tests
 */

import type { Retailer, GeoRegion, BookFormat, ConsentPreferences } from '@/types';

/**
 * Mock retailer data
 */
export const mockRetailer: Retailer = {
  id: 'test-retailer',
  name: 'Test Retailer',
  logo: '/images/retailers/test.svg',
  url: 'https://test-retailer.com/book/[ISBN]',
  geoAvailability: ['US', 'UK'],
  formats: ['hardcover', 'ebook'],
  priority: 1,
};

/**
 * Mock retailers for different regions
 */
export const mockRetailers: Record<string, Retailer> = {
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
    url: 'https://www.barnesandnoble.com/w/[BN_ID]',
    geoAvailability: ['US'],
    formats: ['hardcover', 'paperback', 'ebook', 'audiobook'],
    priority: 2,
  },
};

/**
 * Mock cookie consent preferences
 */
export const mockConsentPreferences: ConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: false,
  timestamp: Date.now(),
  version: '1.0',
};

/**
 * Mock consent preferences - all accepted
 */
export const mockConsentAllAccepted: ConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  timestamp: Date.now(),
  version: '1.0',
};

/**
 * Mock consent preferences - all rejected
 */
export const mockConsentAllRejected: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: Date.now(),
  version: '1.0',
};

/**
 * Mock UTM parameters
 */
export const mockUTMParams = {
  source: 'test',
  medium: 'referral',
  campaign: 'test-campaign',
  content: 'test-content',
};

/**
 * Mock form data
 */
export const mockEmailFormData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
};

/**
 * Mock newsletter form data
 */
export const mockNewsletterFormData = {
  email: 'subscriber@example.com',
  consent: true,
};

/**
 * Mock book formats
 */
export const mockBookFormats: BookFormat[] = [
  'hardcover',
  'paperback',
  'ebook',
  'audiobook',
  'bundle-hardcover',
  'bundle-paperback',
];

/**
 * Mock geo regions
 */
export const mockGeoRegions: GeoRegion[] = ['US', 'UK', 'EU', 'AU'];

/**
 * Mock analytics event
 */
export const mockAnalyticsEvent = {
  event: 'test_event',
  category: 'test',
  action: 'click',
  label: 'test-button',
  value: 1,
};

/**
 * Mock GTM dataLayer entry
 */
export const mockDataLayerEvent = {
  event: 'preorder_click',
  book: 'ai-born',
  retailer: 'amazon',
  format: 'hardcover',
  geo: 'US',
  campaign: 'launch-week',
};

/**
 * Helper function to create mock localStorage
 */
export function createMockLocalStorage() {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
}

/**
 * Helper function to create mock window.dataLayer
 */
export function createMockDataLayer() {
  return [] as Array<Record<string, unknown>>;
}

/**
 * Helper function to wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper function to create mock fetch response
 */
export function createMockFetchResponse<T>(data: T, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic' as ResponseType,
    url: 'https://test.com',
    clone: function () {
      return this;
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response;
}

/**
 * Mock window.matchMedia
 */
export function createMockMatchMedia(matches = false) {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
}
