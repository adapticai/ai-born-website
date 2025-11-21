/**
 * Sign Up Page Analytics Tracker
 *
 * Client component to track page views and interactions on sign-up page
 * Tracks when users view benefits and engage with sign-up options
 *
 * @module components/auth/SignUpPageTracker
 */

"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

/**
 * Sign Up Page Tracker
 * Tracks page view and user engagement on sign-up page
 */
export function SignUpPageTracker() {
  useEffect(() => {
    // Track page view
    trackPageView("/signup", "Sign Up | AI-Born");

    // Track scroll depth on benefits section
    const handleScroll = () => {
      const benefitsSection = document.querySelector('[data-section="benefits"]');
      if (!benefitsSection) return;

      const rect = benefitsSection.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        // Track that user viewed benefits
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'signup_benefits_view',
            page: '/signup',
            timestamp: new Date().toISOString(),
          });
        }

        // Remove listener after first view
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null; // This component doesn't render anything
}
