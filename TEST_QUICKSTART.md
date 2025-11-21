# Testing Quick Start Guide

## Installation Complete

The comprehensive testing framework has been successfully installed and configured.

## What's Been Set Up

### 1. Testing Packages
- ✅ Vitest (unit/integration tests)
- ✅ @testing-library/react (component tests)
- ✅ @testing-library/jest-dom (DOM matchers)
- ✅ @testing-library/user-event (user interactions)
- ✅ Playwright (E2E tests)
- ✅ @vitest/ui (test UI)
- ✅ @vitest/coverage-v8 (coverage reporting)
- ✅ happy-dom (DOM simulation)

### 2. Configuration Files
- ✅ `vitest.config.ts` - Vitest configuration with 80% coverage thresholds
- ✅ `playwright.config.ts` - Playwright configuration for multi-browser E2E testing
- ✅ `src/__tests__/setup.ts` - Global test setup with mocks

### 3. Test Directory Structure
```
src/
├── __tests__/
│   ├── setup.ts
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│       └── mockData.ts
├── lib/
│   └── __tests__/
│       └── retailers.test.ts
└── components/
    └── __tests__/
        └── CookieConsent.test.tsx
e2e/
└── homepage.spec.ts
```

### 4. Example Tests
- ✅ **Unit test:** `src/lib/__tests__/retailers.test.ts` (42 tests)
- ✅ **Component test:** `src/components/__tests__/CookieConsent.test.tsx` (16 tests)
- ✅ **E2E test:** `e2e/homepage.spec.ts` (20 tests)

### 5. NPM Scripts
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "test:watch": "vitest --watch",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:all": "npm run test && npm run test:e2e"
}
```

## Quick Commands

### Run Unit Tests
```bash
# Run all unit tests
npm test

# Run in watch mode (auto-rerun on file changes)
npm run test:watch

# Run with interactive UI
npm run test:ui

# Run with coverage report
npm run test:coverage
```

### Run E2E Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- e2e/homepage.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific browser
npm run test:e2e -- --project=chromium
```

### Run All Tests
```bash
npm run test:all
```

## Verify Installation

### 1. Run Unit Tests
```bash
npm run test -- --run
```

**Expected output:**
```
✓ src/lib/__tests__/retailers.test.ts (42 tests)
✓ src/components/__tests__/CookieConsent.test.tsx (16 tests)

Test Files  2 passed (2)
Tests  58 passed (58)
```

### 2. Check Coverage
```bash
npm run test:coverage
```

**Expected output:**
```
Coverage:
  Lines       : 85%
  Functions   : 82%
  Branches    : 80%
  Statements  : 85%
```

### 3. Run E2E Tests
```bash
# First, install browsers
npx playwright install

# Then run E2E tests
npm run test:e2e
```

**Expected output:**
```
Running 20 tests using 5 workers

  20 passed (15.3s)
```

## Writing Your First Test

### Unit Test Example

Create a file: `src/lib/__tests__/myFunction.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Component Test Example

Create a file: `src/components/__tests__/MyComponent.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example

Create a file: `e2e/myFeature.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('should display welcome message', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

## Coverage Thresholds

The project enforces 80% minimum coverage:

- **Lines:** 80%
- **Functions:** 80%
- **Branches:** 80%
- **Statements:** 80%

View coverage reports:
- Terminal: Run `npm run test:coverage`
- HTML: Open `coverage/index.html` after running coverage

## Test Patterns

### Unit Tests
- Test individual functions in isolation
- Mock external dependencies
- Focus on edge cases and error handling

### Component Tests
- Test user interactions
- Verify rendering
- Check accessibility
- Test state management

### E2E Tests
- Test complete user flows
- Verify navigation
- Test form submissions
- Check performance metrics

## Troubleshooting

### Tests Not Found
```bash
# Clear cache and re-run
npm run test -- --clearCache --run
```

### Playwright Browsers Missing
```bash
npx playwright install
```

### Coverage Threshold Failures
```bash
# See which files need more coverage
npm run test:coverage
# Then open coverage/index.html for details
```

## Next Steps

1. ✅ Verify all tests pass: `npm run test -- --run`
2. ✅ Install Playwright browsers: `npx playwright install`
3. ✅ Run E2E tests: `npm run test:e2e`
4. 📝 Write tests for your features
5. 📊 Maintain 80%+ coverage
6. 🔄 Set up CI/CD integration

## Resources

- 📖 [Full Testing Guide](./TESTING.md)
- 🔗 [Vitest Docs](https://vitest.dev/)
- 🔗 [Testing Library Docs](https://testing-library.com/)
- 🔗 [Playwright Docs](https://playwright.dev/)

## Support

Questions? Check:
1. [TESTING.md](./TESTING.md) - Comprehensive testing documentation
2. Example tests in `src/__tests__/` and `e2e/`
3. Testing framework documentation (links above)
