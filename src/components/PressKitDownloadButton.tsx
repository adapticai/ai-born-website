/**
 * Press Kit Download Button Component
 *
 * Triggers press kit ZIP download with:
 * - Loading state during generation
 * - Error handling with user feedback
 * - Analytics tracking via GTM dataLayer
 * - Accessible keyboard navigation
 * - Visual feedback (icons, state changes)
 */

'use client';

import React, { useState } from 'react';
import { Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

interface PressKitDownloadButtonProps {
  /** Button variant (default, outline, ghost, etc.) */
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Custom button text (default: "Download press kit") */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** User email for tracking (if authenticated) */
  userEmail?: string | null;
  /** User name for tracking (if authenticated) */
  userName?: string | null;
}

type DownloadState = 'idle' | 'loading' | 'success' | 'error';

export function PressKitDownloadButton({
  variant = 'default',
  size = 'default',
  label = 'Download press kit',
  className = '',
  showIcon = true,
  fullWidth = false,
  userEmail = null,
  userName = null,
}: PressKitDownloadButtonProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDownload = async () => {
    setDownloadState('loading');
    setErrorMessage('');

    try {
      // Track download initiation with user info if available
      trackEvent({
        event: 'presskit_download',
        asset_type: 'full-kit',
        timestamp: new Date().toISOString(),
        user_email: userEmail || undefined,
        user_name: userName || undefined,
        authenticated: !!userEmail,
      });

      // Fetch ZIP file from API
      const response = await fetch('/api/presskit/download');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to download press kit');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `AI-Born_Press-Kit_${new Date().toISOString().split('T')[0]}.zip`;

      // Convert response to blob
      const blob = await response.blob();

      // Create download link and trigger
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Set success state
      setDownloadState('success');

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setDownloadState('idle');
      }, 3000);
    } catch (error) {
      console.error('[Press Kit] Download error:', error);

      setDownloadState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to download press kit'
      );

      // Track error
      trackEvent({
        event: 'presskit_download_error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setDownloadState('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  // Get button content based on state
  const getButtonContent = () => {
    switch (downloadState) {
      case 'loading':
        return (
          <>
            {showIcon && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Generating press kit...</span>
          </>
        );
      case 'success':
        return (
          <>
            {showIcon && <CheckCircle2 className="h-4 w-4" />}
            <span>Download started</span>
          </>
        );
      case 'error':
        return (
          <>
            {showIcon && <AlertCircle className="h-4 w-4" />}
            <span>{errorMessage || 'Download failed'}</span>
          </>
        );
      default:
        return (
          <>
            {showIcon && <Download className="h-4 w-4" />}
            <span>{label}</span>
          </>
        );
    }
  };

  return (
    <Button
      variant={downloadState === 'error' ? 'destructive' : variant}
      size={size}
      onClick={handleDownload}
      disabled={downloadState === 'loading'}
      className={`${fullWidth ? 'w-full' : ''} gap-2 ${className}`}
      aria-label={
        downloadState === 'loading'
          ? 'Generating press kit'
          : downloadState === 'success'
          ? 'Download started'
          : downloadState === 'error'
          ? 'Download failed'
          : 'Download press kit'
      }
    >
      {getButtonContent()}
    </Button>
  );
}

/**
 * Compact variant for inline use
 */
export function PressKitDownloadLink({
  label = 'Download full press kit',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <PressKitDownloadButton
      variant="link"
      size="sm"
      label={label}
      className={`h-auto p-0 text-brand-cyan hover:text-brand-cyan/80 ${className}`}
      showIcon={false}
    />
  );
}
