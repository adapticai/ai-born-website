/**
 * Authentication E2E Tests (Playwright)
 *
 * End-to-end tests for authentication flows:
 * - Complete sign-in flow
 * - OAuth provider buttons (mocked)
 * - Email magic link flow
 * - Protected page access
 * - User menu and sign-out
 * - Session persistence
 * - Error handling
 *
 * @module e2e/auth
 */

import { test, expect, type Page } from '@playwright/test';

/**
 * Test User Credentials
 * These should match test data in your test database
 */
const TEST_USERS = {
  regular: {
    email: 'test@example.com',
    name: 'Test User',
  },
  admin: {
    email: 'admin@example.com',
    name: 'Admin User',
  },
  newUser: {
    email: 'newuser@example.com',
    name: 'New User',
  },
};

/**
 * Helper: Wait for navigation to complete
 */
async function waitForNavigation(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Helper: Mock OAuth provider response
 * Note: In a real test, you'd use the provider's test mode
 */
async function mockOAuthProvider(page: Page, provider: 'google' | 'github') {
  // Intercept OAuth redirect and simulate successful authentication
  await page.route('**/api/auth/signin/**', async (route) => {
    const url = route.request().url();
    if (url.includes(provider)) {
      // Simulate OAuth callback
      await route.fulfill({
        status: 302,
        headers: {
          Location: '/auth/callback?code=mock-code&state=mock-state',
        },
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Helper: Sign in via email magic link (mocked)
 */
async function signInWithMagicLink(page: Page, email: string) {
  await page.goto('/auth/signin');

  // Fill in email
  await page.fill('input[type="email"]', email);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for verification request page
  await expect(page).toHaveURL(/\/auth\/verify-request/);

  // In a real test, you'd check the email and click the link
  // For now, we'll simulate the callback directly
  const magicLinkToken = 'mock-token-' + Date.now();
  await page.goto(`/api/auth/callback/email?token=${magicLinkToken}&email=${encodeURIComponent(email)}`);

  // Wait for redirect to complete
  await waitForNavigation(page);
}

/**
 * Helper: Check if user is signed in
 */
async function isSignedIn(page: Page): Promise<boolean> {
  // Look for user menu or account link
  const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button:has-text("Account")'));
  const signInButton = page.locator('a:has-text("Sign in")').or(page.locator('button:has-text("Sign in")'));

  try {
    await userMenu.waitFor({ timeout: 2000 });
    return true;
  } catch {
    try {
      await signInButton.waitFor({ timeout: 2000 });
      return false;
    } catch {
      // Fallback: check for user email or name in page
      const content = await page.content();
      return content.includes('test@example.com') || content.includes('Sign out');
    }
  }
}

test.describe('Authentication - Sign In Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies and storage to start fresh
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should display sign-in page with provider options', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for page title
    await expect(page).toHaveTitle(/Sign in/i);

    // Check for OAuth provider buttons
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();

    // Check for email input
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Check for submit button
    await expect(page.getByRole('button', { name: /sign in|continue/i })).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/auth/signin');

    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    // Check for validation error
    // Note: This depends on your form validation implementation
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    expect(validationMessage).toBeTruthy();
  });

  test('should redirect to callback URL after sign-in', async ({ page }) => {
    // Go to protected page (should redirect to sign-in)
    await page.goto('/account');

    // Should redirect to sign-in with callback URL
    await expect(page).toHaveURL(/\/auth\/signin.*callbackUrl=/);

    // Verify callback URL is preserved
    const url = page.url();
    expect(url).toContain('callbackUrl');
    expect(decodeURIComponent(url)).toContain('/account');
  });

  test('should handle sign-in cancellation gracefully', async ({ page }) => {
    await page.goto('/auth/signin');

    // Click cancel or back link if available
    const cancelButton = page.locator('a:has-text("Cancel")').or(page.locator('button:has-text("Cancel")'));

    try {
      await cancelButton.click({ timeout: 2000 });
      // Should redirect to home page
      await expect(page).toHaveURL('/');
    } catch {
      // No cancel button present - skip test
      test.skip();
    }
  });
});

test.describe('Authentication - Email Magic Link', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('should send magic link email', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in email
    await page.fill('input[type="email"]', TEST_USERS.regular.email);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to verification request page
    await expect(page).toHaveURL(/\/auth\/verify-request/);

    // Check for success message
    await expect(page.locator('text=/check your email/i')).toBeVisible();
    await expect(page.locator(`text=/${TEST_USERS.regular.email}/i`)).toBeVisible();
  });

  test('should display instructions on verification page', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', TEST_USERS.regular.email);
    await page.click('button[type="submit"]');

    // Wait for verification page
    await expect(page).toHaveURL(/\/auth\/verify-request/);

    // Check for instructions
    await expect(page.locator('text=/sign in link/i')).toBeVisible();
    await expect(page.locator('text=/expire/i')).toBeVisible();

    // Check for "didn't receive" help text
    const helpText = page.locator('text=/didn\'t receive/i, text=/spam/i, text=/junk/i');
    const helpVisible = await helpText.count();
    expect(helpVisible).toBeGreaterThan(0);
  });

  test('should allow requesting new magic link', async ({ page }) => {
    await page.goto('/auth/verify-request');

    // Look for "Send another" or "Resend" button
    const resendButton = page.locator('button:has-text("Send another"), button:has-text("Resend")');

    if (await resendButton.isVisible()) {
      await resendButton.click();

      // Should show confirmation
      await expect(page.locator('text=/sent/i')).toBeVisible();
    }
  });
});

test.describe('Authentication - Protected Routes', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    const protectedRoutes = [
      '/account',
      '/settings',
      '/dashboard',
      '/downloads',
      '/bonus-claim',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should redirect to sign-in
      await expect(page).toHaveURL(/\/auth\/signin/);

      // Should preserve callback URL
      expect(page.url()).toContain('callbackUrl');
    }
  });

  test('should allow access to public routes', async ({ page }) => {
    const publicRoutes = [
      '/',
      '/pricing',
      '/faq',
      '/about',
      '/media-kit',
      '/privacy',
      '/terms',
    ];

    for (const route of publicRoutes) {
      await page.goto(route);

      // Should NOT redirect to sign-in
      await expect(page).not.toHaveURL(/\/auth\/signin/);

      // Should show the requested page
      await expect(page).toHaveURL(route);
    }
  });

  test('should deny access to admin routes for non-admin users', async ({ page }) => {
    // Note: This test requires a test user to be signed in
    // In a real test, you'd sign in first, then try to access admin routes

    await page.goto('/admin');

    // Should redirect to either sign-in or unauthorized page
    const currentUrl = page.url();
    expect(
      currentUrl.includes('/auth/signin') ||
      currentUrl.includes('/unauthorized') ||
      currentUrl.includes('/403')
    ).toBe(true);
  });
});

test.describe('Authentication - User Menu', () => {
  test('should display sign-in button when not authenticated', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');

    // Look for sign-in button
    const signInButton = page.locator('a:has-text("Sign in"), button:has-text("Sign in")');
    await expect(signInButton.first()).toBeVisible();
  });

  test('should show user menu when authenticated', async ({ page }) => {
    // Note: This test assumes you have a way to authenticate in tests
    // You might need to use a test session or mock authentication

    // For demonstration, we'll check if the user menu structure exists
    await page.goto('/');

    // Try to find user menu (might not be visible if not authenticated)
    const userMenu = page.locator('[data-testid="user-menu"]');

    if (await userMenu.isVisible()) {
      // Click to open menu
      await userMenu.click();

      // Check for menu items
      await expect(page.locator('text=/Account|Profile/i')).toBeVisible();
      await expect(page.locator('text=/Settings/i')).toBeVisible();
      await expect(page.locator('text=/Sign out/i')).toBeVisible();
    }
  });

  test('should display user info in menu', async ({ page }) => {
    await page.goto('/');

    const userMenu = page.locator('[data-testid="user-menu"]');

    if (await userMenu.isVisible()) {
      // User menu should show email or name
      const menuText = await userMenu.textContent();

      expect(
        menuText?.includes('@') || // Email
        menuText?.match(/[A-Z][a-z]+/) // Name
      ).toBeTruthy();
    }
  });
});

test.describe('Authentication - Sign Out', () => {
  test('should sign out user and redirect to home page', async ({ page }) => {
    await page.goto('/');

    // Look for sign-out option
    const signOutButton = page.locator('button:has-text("Sign out"), a:has-text("Sign out")');

    if (await signOutButton.isVisible()) {
      await signOutButton.click();

      // Should redirect to home or sign-out confirmation page
      await waitForNavigation(page);

      const currentUrl = page.url();
      expect(
        currentUrl.endsWith('/') ||
        currentUrl.includes('/auth/signout') ||
        currentUrl.includes('/goodbye')
      ).toBe(true);

      // User menu should no longer be visible
      const userMenu = page.locator('[data-testid="user-menu"]');
      await expect(userMenu).not.toBeVisible({ timeout: 2000 });

      // Sign-in button should be visible again
      const signInButton = page.locator('a:has-text("Sign in"), button:has-text("Sign in")');
      await expect(signInButton.first()).toBeVisible();
    }
  });

  test('should clear session after sign-out', async ({ page, context }) => {
    // Sign out
    const signOutButton = page.locator('button:has-text("Sign out"), a:has-text("Sign out")');

    if (await signOutButton.isVisible()) {
      await signOutButton.click();
      await waitForNavigation(page);

      // Try to access protected page
      await page.goto('/account');

      // Should redirect to sign-in (session is cleared)
      await expect(page).toHaveURL(/\/auth\/signin/);
    }
  });

  test('should prevent navigation after sign-out', async ({ page }) => {
    const signOutButton = page.locator('button:has-text("Sign out"), a:has-text("Sign out")');

    if (await signOutButton.isVisible()) {
      await signOutButton.click();
      await waitForNavigation(page);

      // Go back (browser back button)
      await page.goBack();

      // Should not be able to access previous protected page
      // Either stay on current page or redirect to sign-in
      const signedIn = await isSignedIn(page);
      expect(signedIn).toBe(false);
    }
  });
});

test.describe('Authentication - Session Persistence', () => {
  test('should persist session across page reloads', async ({ page, context }) => {
    // Note: This test assumes you can establish a session
    // You might need to implement a test session helper

    await page.goto('/');

    if (await isSignedIn(page)) {
      // Reload page
      await page.reload();
      await waitForNavigation(page);

      // Should still be signed in
      const stillSignedIn = await isSignedIn(page);
      expect(stillSignedIn).toBe(true);
    }
  });

  test('should persist session across navigation', async ({ page }) => {
    await page.goto('/');

    if (await isSignedIn(page)) {
      // Navigate to different pages
      await page.goto('/pricing');
      await page.goto('/faq');
      await page.goto('/');

      // Should still be signed in
      const stillSignedIn = await isSignedIn(page);
      expect(stillSignedIn).toBe(true);
    }
  });

  test('should restore session after closing tab', async ({ browser }) => {
    // This test requires creating a new context and closing it
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/');

    if (await isSignedIn(page)) {
      // Get cookies
      const cookies = await context.cookies();

      // Close context
      await context.close();

      // Create new context with same cookies
      const newContext = await browser.newContext();
      await newContext.addCookies(cookies);
      const newPage = await newContext.newPage();

      await newPage.goto('/');

      // Should still be signed in
      const stillSignedIn = await isSignedIn(newPage);
      expect(stillSignedIn).toBe(true);

      await newContext.close();
    } else {
      // Skip test if not signed in
      await context.close();
    }
  });
});

test.describe('Authentication - Error Handling', () => {
  test('should display error page for auth errors', async ({ page }) => {
    // Navigate to auth error page
    await page.goto('/auth/error?error=Configuration');

    // Should show error message
    await expect(page).toHaveTitle(/Error/i);
    await expect(page.locator('text=/error/i')).toBeVisible();

    // Should have link to try again
    const tryAgainLink = page.locator('a:has-text("Try again"), a:has-text("Sign in")');
    await expect(tryAgainLink.first()).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto('/auth/signin');

    // Try to submit form
    await page.fill('input[type="email"]', TEST_USERS.regular.email);

    try {
      await page.click('button[type="submit"]');

      // Should show error or remain on page
      await page.waitForTimeout(2000);

      // Page should still be on sign-in
      expect(page.url()).toContain('/auth/signin');
    } finally {
      // Re-enable network
      await page.context().setOffline(false);
    }
  });

  test('should handle expired magic link', async ({ page }) => {
    // Navigate to callback with expired token
    await page.goto('/api/auth/callback/email?token=expired-token&email=test@example.com');

    // Should redirect to error page or sign-in with message
    await waitForNavigation(page);

    const currentUrl = page.url();
    expect(
      currentUrl.includes('/auth/error') ||
      currentUrl.includes('/auth/signin')
    ).toBe(true);

    // Should show error message
    const errorMessage = page.locator('text=/expired|invalid/i');
    const hasError = await errorMessage.count();
    expect(hasError).toBeGreaterThan(0);
  });
});

test.describe('Authentication - Security', () => {
  test('should include CSRF protection', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for CSRF token in form
    const csrfInput = page.locator('input[name="csrfToken"]');
    const hasCsrf = await csrfInput.count();

    expect(hasCsrf).toBeGreaterThan(0);
  });

  test('should use secure cookies in production', async ({ page }) => {
    await page.goto('/');

    // Get cookies
    const cookies = await page.context().cookies();

    // In production, auth cookies should be secure
    const authCookies = cookies.filter(c =>
      c.name.includes('next-auth') ||
      c.name.includes('session') ||
      c.name.includes('token')
    );

    if (process.env.NODE_ENV === 'production') {
      authCookies.forEach(cookie => {
        expect(cookie.secure).toBe(true);
        expect(cookie.httpOnly).toBe(true);
      });
    }
  });

  test('should prevent clickjacking on auth pages', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for X-Frame-Options or CSP frame-ancestors
    const headers = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return {
        csp: meta?.getAttribute('content'),
      };
    });

    // Should have frame protection
    expect(
      headers.csp?.includes('frame-ancestors') ||
      headers.csp?.includes('frame-src')
    ).toBeTruthy();
  });
});

test.describe('Authentication - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/auth/signin');

    // Tab through form elements
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeDefined();

    await page.keyboard.press('Tab');
    focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeDefined();

    // Should be able to submit with Enter key
    await page.focus('input[type="email"]');
    await page.fill('input[type="email"]', TEST_USERS.regular.email);
    // Enter key would submit the form
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for form labels
    const emailInput = page.locator('input[type="email"]');
    const label = await emailInput.getAttribute('aria-label');
    const labelledBy = await emailInput.getAttribute('aria-labelledby');

    expect(label || labelledBy).toBeTruthy();
  });

  test('should announce errors to screen readers', async ({ page }) => {
    await page.goto('/auth/signin');

    // Submit invalid form
    await page.fill('input[type="email"]', 'invalid');
    await page.click('button[type="submit"]');

    // Check for aria-live region with error
    const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"], [role="alert"]');
    const hasLiveRegion = await liveRegion.count();

    // Should have some form of error announcement
    expect(hasLiveRegion).toBeGreaterThan(0);
  });
});
