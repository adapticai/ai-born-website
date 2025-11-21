# Testing Guide

This document provides comprehensive information about the testing infrastructure for the AI-Born website.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Requirements](#coverage-requirements)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The AI-Born website uses a comprehensive testing strategy with three layers:

1. **Unit Tests** - Test individual functions and utilities in isolation
2. **Component Tests** - Test React components with user interactions
3. **E2E Tests** - Test complete user flows in a real browser

## Testing Stack

### Unit & Component Tests
- **Vitest** - Fast unit test framework built on Vite
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation
- **happy-dom** - Lightweight DOM implementation

### E2E Tests
- **Playwright** - Modern end-to-end testing framework
- **Multi-browser support** - Chromium, Firefox, WebKit
- **Mobile & Desktop** - Tests across different viewport sizes

## Project Structure

```
ai-born-website/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts              # Global test setup
│   │   ├── unit/                 # Unit tests
│   │   ├── integration/          # Integration tests
│   │   └── fixtures/
│   │       └── mockData.ts       # Shared mock data
│   ├── lib/
│   │   └── __tests__/
│   │       └── retailers.test.ts # Retailer utilities tests
│   └── components/
│       └── __tests__/
│           └── CookieConsent.test.tsx # Component tests
├── e2e/
│   └── homepage.spec.ts          # E2E tests
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
└── TESTING.md                    # This file
```

## Running Tests

### Unit & Component Tests

```bash
# Run all unit/component tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all
```

## Writing Tests

### Unit Tests

Unit tests should test individual functions in isolation.

**Example:** Testing a utility function

```typescript
import { describe, it, expect } from 'vitest';
import { buildUTMParams, utmParamsToString } from '../retailers';

describe('Retailer Utilities', () => {
  describe('buildUTMParams', () => {
    it('should return default UTM parameters', () => {
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
      });

      expect(params).toEqual({
        source: 'website',
        medium: 'referral',
        campaign: 'ai-born-launch',
        content: 'hero-cta',
      });
    });
  });
});
```

### Component Tests

Component tests should test React components with user interactions.

**Example:** Testing a React component

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieConsent } from '../CookieConsent';

describe('CookieConsent Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render banner when no consent is stored', () => {
    render(<CookieConsent />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
  });

  it('should save preferences when Accept All is clicked', async () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByText('Accept All');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      const stored = localStorage.getItem('ai-born-cookie-consent');
      expect(stored).toBeTruthy();
    });
  });
});
```

### E2E Tests

E2E tests should test complete user flows in a real browser.

**Example:** Testing user flow

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display cookie consent on first visit', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');

    const consentBanner = page.getByRole('dialog', { name: /cookie/i });
    await expect(consentBanner).toBeVisible();
  });

  test('should open retailer menu when CTA is clicked', async ({ page }) => {
    await page.goto('/');

    const preorderButton = page.getByRole('button', { name: /pre-order/i }).first();
    await preorderButton.click();

    // Verify retailer menu opened
    await expect(page.getByText('Amazon')).toBeVisible();
  });
});
```

## Coverage Requirements

The project enforces the following minimum coverage thresholds:

- **Lines:** 80%
- **Functions:** 80%
- **Branches:** 80%
- **Statements:** 80%

### Viewing Coverage Reports

After running `npm run test:coverage`, coverage reports are generated in multiple formats:

- **Terminal:** Summary displayed in console
- **HTML:** Open `coverage/index.html` in browser for detailed report
- **LCOV:** Machine-readable format for CI/CD integration

### Excluded from Coverage

The following are excluded from coverage requirements:

- Test files (`*.test.ts`, `*.spec.ts`)
- Configuration files (`*.config.ts`)
- Type definitions (`*.d.ts`)
- Mock data (`mockData.ts`)
- Build artifacts (`.next/`, `dist/`, `node_modules/`)

## Best Practices

### General

1. **Test behavior, not implementation** - Focus on what the code does, not how it does it
2. **Write descriptive test names** - Use clear, specific descriptions
3. **Keep tests isolated** - Each test should be independent
4. **Use beforeEach/afterEach** - Clean up state between tests
5. **Mock external dependencies** - Don't rely on network requests or external services

### Unit Tests

```typescript
// ✅ Good - Tests behavior
it('should return filtered retailers for US region', () => {
  const retailers = getRetailersByGeo('US');
  expect(retailers.every(r => r.geoAvailability.includes('US'))).toBe(true);
});

// ❌ Bad - Tests implementation
it('should call filter method', () => {
  const spy = vi.spyOn(Array.prototype, 'filter');
  getRetailersByGeo('US');
  expect(spy).toHaveBeenCalled();
});
```

### Component Tests

```typescript
// ✅ Good - Tests user interaction
it('should toggle checkbox when clicked', async () => {
  const user = userEvent.setup();
  render(<CookieConsent />);

  const checkbox = screen.getByLabelText('Analytics Cookies');
  await user.click(checkbox);

  expect(checkbox).toBeChecked();
});

// ❌ Bad - Tests internal state
it('should update state when clicked', () => {
  const { container } = render(<CookieConsent />);
  // Don't access internal state directly
});
```

### E2E Tests

```typescript
// ✅ Good - Tests complete user flow
test('should complete purchase flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /pre-order/i }).click();
  await page.getByText('Amazon').click();
  // Verify navigation to Amazon
});

// ❌ Bad - Tests too granular
test('should have button', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button')).toBeVisible();
});
```

### Accessibility Testing

Always include accessibility checks in component tests:

```typescript
it('should have proper ARIA attributes', () => {
  render(<CookieConsent />);

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-labelledby');
  expect(dialog).toHaveAttribute('aria-describedby');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
});

it('should be keyboard navigable', async () => {
  const user = userEvent.setup();
  render(<CookieConsent />);

  await user.tab();
  expect(screen.getByText('Accept All')).toHaveFocus();
});
```

## Mock Data

Use shared mock data from `src/__tests__/fixtures/mockData.ts`:

```typescript
import { mockRetailer, mockConsentPreferences } from '@/__tests__/fixtures/mockData';

it('should display retailer information', () => {
  const info = getRetailerDisplayInfo(mockRetailer.id);
  expect(info.name).toBe(mockRetailer.name);
});
```

## Troubleshooting

### Tests Failing Locally

1. **Clear test cache:**
   ```bash
   npm run test -- --clearCache
   ```

2. **Update snapshots:**
   ```bash
   npm run test -- -u
   ```

3. **Run tests in sequence:**
   ```bash
   npm run test -- --no-threads
   ```

### E2E Tests Failing

1. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

2. **Run in headed mode to see what's happening:**
   ```bash
   npm run test:e2e -- --headed
   ```

3. **Generate test report:**
   ```bash
   npx playwright show-report
   ```

### Common Issues

**Issue:** Tests pass locally but fail in CI

**Solution:** Check environment variables and ensure all dependencies are installed

**Issue:** Timeout errors in E2E tests

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
use: {
  navigationTimeout: 30000, // 30 seconds
}
```

**Issue:** localStorage not working in tests

**Solution:** Ensure `setup.ts` is properly configured and imported

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Performance Testing

E2E tests include performance checks:

```typescript
test('should have acceptable LCP', async ({ page }) => {
  await page.goto('/');

  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.renderTime || lastEntry.loadTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
  });

  expect(lcp).toBeLessThan(2500); // 2.5 seconds
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Support

For questions or issues with testing:

1. Check this documentation
2. Review existing tests for examples
3. Check the testing framework documentation
4. Open an issue in the project repository
