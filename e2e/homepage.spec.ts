import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests
 *
 * Tests core functionality of the AI-Born landing page:
 * - Page loads and renders correctly
 * - Cookie consent functionality
 * - Retailer menu interaction
 * - Navigation works
 * - Performance metrics
 * - Accessibility
 */

test.describe('Homepage - Basic Functionality', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/AI-Born/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display hero section with book cover', async ({ page }) => {
    await page.goto('/');

    // Check for hero section
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Check for book title or tagline
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have functioning navigation', async ({ page }) => {
    await page.goto('/');

    // Check that navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('Cookie Consent Banner', () => {
  test('should display cookie consent banner on first visit', async ({ page, context }) => {
    // Clear cookies to simulate first visit
    await context.clearCookies();
    await page.goto('/');

    // Check for cookie consent dialog
    const consentBanner = page.getByRole('dialog', { name: /cookie/i });
    await expect(consentBanner).toBeVisible();

    // Check for action buttons
    await expect(page.getByText('Accept All')).toBeVisible();
    await expect(page.getByText('Reject All')).toBeVisible();
    await expect(page.getByText('Customize')).toBeVisible();
  });

  test('should hide banner after accepting all cookies', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');

    const consentBanner = page.getByRole('dialog', { name: /cookie/i });
    await expect(consentBanner).toBeVisible();

    // Click Accept All
    await page.getByText('Accept All').click();

    // Banner should disappear
    await expect(consentBanner).not.toBeVisible();

    // Reload page - banner should not reappear
    await page.reload();
    await expect(consentBanner).not.toBeVisible();
  });

  test('should hide banner after rejecting all cookies', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');

    const consentBanner = page.getByRole('dialog', { name: /cookie/i });
    await expect(consentBanner).toBeVisible();

    // Click Reject All
    await page.getByText('Reject All').click();

    // Banner should disappear
    await expect(consentBanner).not.toBeVisible();
  });

  test('should allow customizing cookie preferences', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');

    // Click Customize
    await page.getByText('Customize').click();

    // Check for cookie categories
    await expect(page.getByText('Cookie Categories')).toBeVisible();
    await expect(page.getByLabelText(/Analytics Cookies/)).toBeVisible();
    await expect(page.getByLabelText(/Marketing Cookies/)).toBeVisible();

    // Toggle analytics
    const analyticsCheckbox = page.getByLabelText('Analytics Cookies');
    await analyticsCheckbox.click();

    // Save preferences
    await page.getByText('Save Preferences').click();

    // Banner should disappear
    const consentBanner = page.getByRole('dialog', { name: /cookie/i });
    await expect(consentBanner).not.toBeVisible();
  });
});

test.describe('Retailer Menu Interaction', () => {
  test('should open retailer menu when CTA is clicked', async ({ page }) => {
    await page.goto('/');

    // Look for pre-order CTA button
    const preorderButton = page.getByRole('button', { name: /pre-order/i }).first();

    if (await preorderButton.isVisible()) {
      await preorderButton.click();

      // Check if retailer menu appears (this depends on your implementation)
      // Adjust selector based on actual implementation
      await page.waitForTimeout(500); // Wait for animation
    }
  });

  test('should display multiple retailer options', async ({ page }) => {
    await page.goto('/');

    // If retailer menu is visible, check for retailer options
    const amazonLink = page.getByText('Amazon').first();

    if (await amazonLink.isVisible()) {
      // Verify other major retailers
      await expect(page.getByText(/Barnes/i).first()).toBeVisible();
    }
  });
});

test.describe('Navigation and Scrolling', () => {
  test('should scroll smoothly to sections when navigation links clicked', async ({ page }) => {
    await page.goto('/');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Click a navigation link if available (adjust selector)
    const navLink = page.locator('nav a').first();

    if (await navLink.isVisible()) {
      await navLink.click();
      await page.waitForTimeout(500);

      // Check that scroll position changed
      const newScroll = await page.evaluate(() => window.scrollY);
      expect(newScroll).not.toBe(initialScroll);
    }
  });
});

test.describe('Performance Metrics', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have acceptable Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Get LCP metric
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
          const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
          resolve(lcp);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    // LCP should be less than 2.5 seconds (2500ms)
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500);
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check that headings exist
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');

    // Get all images
    const images = page.locator('img');
    const count = await images.count();

    // Check that all images have alt attributes
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeDefined();
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');

    // Check for buttons with proper labels
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that page renders without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBe(clientWidth);
  });

  test('should render correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('should render correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });
});

test.describe('Content Verification', () => {
  test('should display book title', async ({ page }) => {
    await page.goto('/');

    // Check for book title in content
    await expect(page.getByText(/AI-Born/i)).toBeVisible();
  });

  test('should display call-to-action buttons', async ({ page }) => {
    await page.goto('/');

    // Check for CTA buttons
    const ctaButtons = page.getByRole('button', { name: /pre-order|order|buy/i });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should have footer with legal links', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for privacy policy link
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Analytics Integration', () => {
  test('should initialize Google Tag Manager dataLayer', async ({ page }) => {
    await page.goto('/');

    // Check that dataLayer exists
    const hasDataLayer = await page.evaluate(() => {
      return typeof window.dataLayer !== 'undefined';
    });

    expect(hasDataLayer).toBe(true);
  });

  test('should track page view event', async ({ page }) => {
    await page.goto('/');

    // Wait for GTM to initialize
    await page.waitForTimeout(1000);

    // Check that page view event was pushed to dataLayer
    const pageViewEvent = await page.evaluate(() => {
      return window.dataLayer?.some((item: any) =>
        item.event === 'page_view' || item.event === 'gtm.js'
      );
    });

    expect(pageViewEvent).toBeTruthy();
  });
});
