import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieConsent, CookieSettingsButton, useConsent } from '../CookieConsent';

// Mock localStorage and dataLayer are set up in setup.ts

describe('CookieConsent Component', () => {
  beforeEach(() => {
    localStorage.clear();
    (window.dataLayer as unknown[]) = [];
  });

  describe('Banner Rendering', () => {
    it('should render banner when no consent is stored', () => {
      render(<CookieConsent />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
    });

    it('should not render when consent is already stored', () => {
      localStorage.setItem(
        'ai-born-cookie-consent',
        JSON.stringify({
          necessary: true,
          analytics: true,
          marketing: false,
          timestamp: Date.now(),
          version: '1.0',
        })
      );

      render(<CookieConsent />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render with correct ARIA attributes', () => {
      render(<CookieConsent />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'cookie-consent-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'cookie-consent-description');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should render all action buttons', () => {
      render(<CookieConsent />);

      expect(screen.getByText('Customize')).toBeInTheDocument();
      expect(screen.getByText('Reject All')).toBeInTheDocument();
      expect(screen.getByText('Accept All')).toBeInTheDocument();
    });

    it('should render policy links', () => {
      render(<CookieConsent />);

      const cookiePolicyLink = screen.getByText('Cookie Policy');
      const privacyPolicyLink = screen.getByText('Privacy Policy');

      expect(cookiePolicyLink).toHaveAttribute('href', '/privacy#cookies');
      expect(privacyPolicyLink).toHaveAttribute('href', '/privacy');
    });
  });

  describe('Accept All Functionality', () => {
    it('should save all consents when Accept All is clicked', async () => {
      render(<CookieConsent />);

      const acceptButton = screen.getByText('Accept All');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        const stored = localStorage.getItem('ai-born-cookie-consent');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed.necessary).toBe(true);
        expect(parsed.analytics).toBe(true);
        expect(parsed.marketing).toBe(true);
        expect(parsed.version).toBe('1.0');
      });
    });

    it('should trigger GTM event when Accept All is clicked', async () => {
      render(<CookieConsent />);

      const acceptButton = screen.getByText('Accept All');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(window.dataLayer).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              event: 'cookie_consent_update',
              consent_preferences: {
                analytics: true,
                marketing: true,
              },
            }),
          ])
        );
      });
    });
  });

  describe('Reject All Functionality', () => {
    it('should save only necessary consent when Reject All is clicked', async () => {
      render(<CookieConsent />);

      const rejectButton = screen.getByText('Reject All');
      fireEvent.click(rejectButton);

      await waitFor(() => {
        const stored = localStorage.getItem('ai-born-cookie-consent');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed.necessary).toBe(true);
        expect(parsed.analytics).toBe(false);
        expect(parsed.marketing).toBe(false);
      });
    });

    it('should reject all when close button (X) is clicked', async () => {
      render(<CookieConsent />);

      const closeButton = screen.getByLabelText('Reject all cookies and close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        const stored = localStorage.getItem('ai-born-cookie-consent');
        const parsed = JSON.parse(stored!);
        expect(parsed.analytics).toBe(false);
        expect(parsed.marketing).toBe(false);
      });
    });
  });

  describe('Customize Functionality', () => {
    it('should show customization panel when Customize is clicked', async () => {
      render(<CookieConsent />);

      const customizeButton = screen.getByText('Customize');
      fireEvent.click(customizeButton);

      await waitFor(() => {
        expect(screen.getByText('Cookie Categories')).toBeInTheDocument();
      });
    });

    it('should allow toggling analytics and marketing cookies', async () => {
      const user = userEvent.setup();
      render(<CookieConsent />);

      const customizeButton = screen.getByText('Customize');
      await user.click(customizeButton);

      const analyticsCheckbox = screen.getByLabelText('Analytics Cookies');
      const marketingCheckbox = screen.getByLabelText('Marketing Cookies');

      expect(analyticsCheckbox).not.toBeChecked();
      expect(marketingCheckbox).not.toBeChecked();

      await user.click(analyticsCheckbox);
      expect(analyticsCheckbox).toBeChecked();

      await user.click(marketingCheckbox);
      expect(marketingCheckbox).toBeChecked();
    });

    it('should save custom preferences when Save Preferences is clicked', async () => {
      const user = userEvent.setup();
      render(<CookieConsent />);

      const customizeButton = screen.getByText('Customize');
      await user.click(customizeButton);

      const analyticsCheckbox = screen.getByLabelText('Analytics Cookies');
      await user.click(analyticsCheckbox);

      const saveButton = screen.getByText('Save Preferences');
      await user.click(saveButton);

      await waitFor(() => {
        const stored = localStorage.getItem('ai-born-cookie-consent');
        const parsed = JSON.parse(stored!);
        expect(parsed.analytics).toBe(true);
        expect(parsed.marketing).toBe(false);
      });
    });
  });
});

describe('useConsent Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    (window.dataLayer as unknown[]) = [];
  });

  it('should initialize with no preferences on first visit', () => {
    const { result } = renderHook(() => useConsent());

    expect(result.current.preferences).toBeNull();
    expect(result.current.hasChoiceMade).toBe(false);
  });

  it('should accept all cookies', () => {
    const { result } = renderHook(() => useConsent());

    act(() => {
      result.current.acceptAll();
    });

    expect(result.current.preferences).toMatchObject({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    expect(result.current.hasChoiceMade).toBe(true);
  });

  it('should reject all non-necessary cookies', () => {
    const { result } = renderHook(() => useConsent());

    act(() => {
      result.current.rejectAll();
    });

    expect(result.current.preferences).toMatchObject({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  });

  it('should persist preferences to localStorage', () => {
    const { result } = renderHook(() => useConsent());

    act(() => {
      result.current.acceptAll();
    });

    const stored = localStorage.getItem('ai-born-cookie-consent');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.version).toBe('1.0');
    expect(parsed.timestamp).toBeGreaterThan(0);
  });

  it('should handle version mismatch by resetting consent', () => {
    const oldPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
      version: '0.9',
    };
    localStorage.setItem('ai-born-cookie-consent', JSON.stringify(oldPreferences));

    const { result } = renderHook(() => useConsent());

    expect(result.current.preferences).toBeNull();
    expect(result.current.hasChoiceMade).toBe(false);
  });
});
