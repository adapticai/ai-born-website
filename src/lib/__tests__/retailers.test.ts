import { describe, it, expect } from 'vitest';
import {
  buildUTMParams,
  utmParamsToString,
  getRetailerUrl,
  getRetailersByGeo,
  getDefaultRetailers,
  getRetailersByFormat,
  getRetailerById,
  getAllFormats,
  getIndividualFormats,
  getBundleFormats,
  formatDisplayName,
  getBundleDescription,
  isBundle,
  retailerSupportsFormat,
  getRetailerDisplayInfo,
  retailerData,
} from '../retailers';
import type { GeoRegion, BookFormat } from '@/types';

describe('Retailer Utilities', () => {
  describe('buildUTMParams', () => {
    it('should return default UTM parameters when no params provided', () => {
      const params = buildUTMParams();

      expect(params).toEqual({
        source: 'website',
        medium: 'referral',
        campaign: 'ai-born-launch',
      });
    });

    it('should merge provided params with defaults', () => {
      const params = buildUTMParams({
        content: 'hero-cta',
        term: 'hardcover',
      });

      expect(params).toEqual({
        source: 'website',
        medium: 'referral',
        campaign: 'ai-born-launch',
        content: 'hero-cta',
        term: 'hardcover',
      });
    });

    it('should override defaults when provided', () => {
      const params = buildUTMParams({
        source: 'email',
        campaign: 'newsletter',
      });

      expect(params).toEqual({
        source: 'email',
        medium: 'referral',
        campaign: 'newsletter',
      });
    });
  });

  describe('utmParamsToString', () => {
    it('should convert UTM params to URL query string', () => {
      const params = {
        source: 'website',
        medium: 'referral',
        campaign: 'ai-born-launch',
      };

      const result = utmParamsToString(params);

      expect(result).toBe('utm_source=website&utm_medium=referral&utm_campaign=ai-born-launch');
    });

    it('should handle special characters by URL encoding', () => {
      const params = {
        source: 'website',
        content: 'hero cta & button',
      };

      const result = utmParamsToString(params);

      expect(result).toContain('hero%20cta%20%26%20button');
    });

    it('should filter out undefined and empty values', () => {
      const params = {
        source: 'website',
        medium: '',
        campaign: undefined as unknown as string,
        content: 'test',
      };

      const result = utmParamsToString(params);

      expect(result).toBe('utm_source=website&utm_content=test');
    });

    it('should add utm_ prefix to keys without it', () => {
      const params = {
        source: 'website',
      };

      const result = utmParamsToString(params);

      expect(result).toBe('utm_source=website');
    });
  });

  describe('getRetailerUrl', () => {
    it('should return URL with UTM parameters', () => {
      const url = getRetailerUrl('amazon', 'hardcover');

      expect(url).toContain('utm_source=website');
      expect(url).toContain('utm_medium=referral');
      expect(url).toContain('utm_campaign=ai-born-launch');
      expect(url).toContain('utm_content=amazon-hardcover');
    });

    it('should return # for unsupported retailer/format combinations', () => {
      const url = getRetailerUrl('bookshop', 'audiobook');

      expect(url).toBe('#');
    });

    it('should use custom UTM params when provided', () => {
      const customUTM = {
        source: 'email',
        campaign: 'newsletter',
      };

      const url = getRetailerUrl('amazon', 'ebook', customUTM);

      expect(url).toContain('utm_source=email');
      expect(url).toContain('utm_campaign=newsletter');
    });

    it('should handle URLs that already have query parameters', () => {
      const url = getRetailerUrl('googleplay', 'ebook');

      // Google Play template includes '?id='
      expect(url).toContain('?');
      expect(url).toContain('&utm_');
    });
  });

  describe('getRetailersByGeo', () => {
    it('should return all US retailers sorted by priority', () => {
      const retailers = getRetailersByGeo('US');

      expect(retailers.length).toBeGreaterThan(0);
      expect(retailers[0].priority).toBeLessThanOrEqual(retailers[1].priority || 99);

      // All returned retailers should support US
      retailers.forEach((retailer) => {
        expect(retailer.geoAvailability).toContain('US');
      });
    });

    it('should return UK-only retailers', () => {
      const retailers = getRetailersByGeo('UK');

      retailers.forEach((retailer) => {
        expect(retailer.geoAvailability).toContain('UK');
      });
    });

    it('should sort retailers by priority', () => {
      const retailers = getRetailersByGeo('US');

      for (let i = 0; i < retailers.length - 1; i++) {
        const currentPriority = retailers[i].priority || 99;
        const nextPriority = retailers[i + 1].priority || 99;
        expect(currentPriority).toBeLessThanOrEqual(nextPriority);
      }
    });
  });

  describe('getDefaultRetailers', () => {
    it('should return top 4 retailers for a region', () => {
      const retailers = getDefaultRetailers('US');

      expect(retailers).toHaveLength(4);
    });

    it('should return retailers in priority order', () => {
      const retailers = getDefaultRetailers('US');

      for (let i = 0; i < retailers.length - 1; i++) {
        const currentPriority = retailers[i].priority || 99;
        const nextPriority = retailers[i + 1].priority || 99;
        expect(currentPriority).toBeLessThanOrEqual(nextPriority);
      }
    });
  });

  describe('getRetailersByFormat', () => {
    it('should return retailers supporting hardcover format', () => {
      const retailers = getRetailersByFormat('hardcover');

      retailers.forEach((retailer) => {
        expect(retailer.formats).toContain('hardcover');
      });
    });

    it('should return retailers supporting audiobook format', () => {
      const retailers = getRetailersByFormat('audiobook');

      retailers.forEach((retailer) => {
        expect(retailer.formats).toContain('audiobook');
      });
    });

    it('should filter by geo region when provided', () => {
      const retailers = getRetailersByFormat('hardcover', 'UK');

      retailers.forEach((retailer) => {
        expect(retailer.formats).toContain('hardcover');
        expect(retailer.geoAvailability).toContain('UK');
      });
    });

    it('should return sorted by priority', () => {
      const retailers = getRetailersByFormat('ebook');

      for (let i = 0; i < retailers.length - 1; i++) {
        const currentPriority = retailers[i].priority || 99;
        const nextPriority = retailers[i + 1].priority || 99;
        expect(currentPriority).toBeLessThanOrEqual(nextPriority);
      }
    });
  });

  describe('getRetailerById', () => {
    it('should return retailer data for valid ID', () => {
      const retailer = getRetailerById('amazon');

      expect(retailer).toBeDefined();
      expect(retailer?.id).toBe('amazon');
      expect(retailer?.name).toBe('Amazon');
    });

    it('should return undefined for invalid ID', () => {
      const retailer = getRetailerById('invalid-retailer');

      expect(retailer).toBeUndefined();
    });
  });

  describe('getAllFormats', () => {
    it('should return all available formats including bundles', () => {
      const formats = getAllFormats();

      expect(formats).toEqual([
        'hardcover',
        'paperback',
        'ebook',
        'audiobook',
        'bundle-hardcover',
        'bundle-paperback',
      ]);
    });
  });

  describe('getIndividualFormats', () => {
    it('should return only individual formats (no bundles)', () => {
      const formats = getIndividualFormats();

      expect(formats).toEqual(['hardcover', 'paperback', 'ebook', 'audiobook']);
      expect(formats).not.toContain('bundle-hardcover');
      expect(formats).not.toContain('bundle-paperback');
    });
  });

  describe('getBundleFormats', () => {
    it('should return only bundle formats', () => {
      const formats = getBundleFormats();

      expect(formats).toEqual(['bundle-hardcover', 'bundle-paperback']);
    });
  });

  describe('formatDisplayName', () => {
    it('should return correct display names', () => {
      expect(formatDisplayName('hardcover')).toBe('Hardcover');
      expect(formatDisplayName('ebook')).toBe('eBook');
      expect(formatDisplayName('audiobook')).toBe('Audiobook');
      expect(formatDisplayName('bundle-hardcover')).toBe('Complete Bundle (Hardcover)');
    });

    it('should return original format for unknown formats', () => {
      const unknownFormat = 'unknown' as BookFormat;
      expect(formatDisplayName(unknownFormat)).toBe('unknown');
    });
  });

  describe('getBundleDescription', () => {
    it('should return description for hardcover bundle', () => {
      const desc = getBundleDescription('bundle-hardcover');

      expect(desc).toBe('Hardcover + eBook + Audiobook');
    });

    it('should return description for paperback bundle', () => {
      const desc = getBundleDescription('bundle-paperback');

      expect(desc).toBe('Paperback + eBook + Audiobook');
    });

    it('should return empty string for non-bundle formats', () => {
      expect(getBundleDescription('hardcover')).toBe('');
      expect(getBundleDescription('ebook')).toBe('');
    });
  });

  describe('isBundle', () => {
    it('should return true for bundle formats', () => {
      expect(isBundle('bundle-hardcover')).toBe(true);
      expect(isBundle('bundle-paperback')).toBe(true);
    });

    it('should return false for individual formats', () => {
      expect(isBundle('hardcover')).toBe(false);
      expect(isBundle('ebook')).toBe(false);
      expect(isBundle('audiobook')).toBe(false);
    });
  });

  describe('retailerSupportsFormat', () => {
    it('should return true when retailer supports format', () => {
      expect(retailerSupportsFormat('amazon', 'hardcover')).toBe(true);
      expect(retailerSupportsFormat('applebooks', 'ebook')).toBe(true);
      expect(retailerSupportsFormat('audible', 'audiobook')).toBe(true);
    });

    it('should return false when retailer does not support format', () => {
      expect(retailerSupportsFormat('bookshop', 'audiobook')).toBe(false);
      expect(retailerSupportsFormat('kobo', 'hardcover')).toBe(false);
    });

    it('should return false for invalid retailer ID', () => {
      expect(retailerSupportsFormat('invalid', 'hardcover')).toBe(false);
    });
  });

  describe('getRetailerDisplayInfo', () => {
    it('should return display info for valid retailer', () => {
      const info = getRetailerDisplayInfo('amazon');

      expect(info).toEqual({
        name: 'Amazon',
        logo: '/images/retailers/amazon.svg',
        available: true,
      });
    });

    it('should return fallback info for invalid retailer', () => {
      const info = getRetailerDisplayInfo('invalid-retailer');

      expect(info).toEqual({
        name: 'invalid-retailer',
        logo: '/images/retailers/default.svg',
        available: false,
      });
    });
  });

  describe('retailerData integrity', () => {
    it('should have all required fields for each retailer', () => {
      Object.values(retailerData).forEach((retailer) => {
        expect(retailer.id).toBeDefined();
        expect(retailer.name).toBeDefined();
        expect(retailer.logo).toBeDefined();
        expect(retailer.url).toBeDefined();
        expect(retailer.geoAvailability).toBeInstanceOf(Array);
        expect(retailer.geoAvailability.length).toBeGreaterThan(0);
        expect(retailer.formats).toBeInstanceOf(Array);
        expect(retailer.formats.length).toBeGreaterThan(0);
        expect(retailer.priority).toBeDefined();
        expect(typeof retailer.priority).toBe('number');
      });
    });

    it('should have unique retailer IDs', () => {
      const ids = Object.keys(retailerData);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have defined priority values', () => {
      Object.values(retailerData).forEach((retailer) => {
        expect(retailer.priority).toBeDefined();
        expect(typeof retailer.priority).toBe('number');
        expect(retailer.priority).toBeGreaterThan(0);
      });
    });

    it('should have valid geo regions', () => {
      const validRegions: GeoRegion[] = ['US', 'UK', 'EU', 'AU'];

      Object.values(retailerData).forEach((retailer) => {
        retailer.geoAvailability.forEach((region) => {
          expect(validRegions).toContain(region);
        });
      });
    });

    it('should have valid formats', () => {
      const validFormats = getAllFormats();

      Object.values(retailerData).forEach((retailer) => {
        retailer.formats.forEach((format) => {
          expect(validFormats).toContain(format);
        });
      });
    });
  });
});
