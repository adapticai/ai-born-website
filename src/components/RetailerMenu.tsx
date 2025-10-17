'use client';

import * as React from 'react';

import { ChevronDown, Globe, ExternalLink, Package } from 'lucide-react';

import { CTAButton } from '@/components/CTAButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { trackEvent } from '@/lib/analytics';
import { detectUserGeo, saveGeoPreference, getAllRegions, getRegionDisplayName } from '@/lib/geo';
import { getFormattedPrice, getBundleSavingsPercentage } from '@/lib/pricing';
import { getDefaultRetailers, getRetailerUrl, formatDisplayName, getIndividualFormats, getBundleFormats, getBundleDescription, isBundle } from '@/lib/retailers';
import { cn } from '@/lib/utils';
import type { GeoRegion, BookFormat, Retailer } from '@/types';

export interface RetailerMenuProps {
  /**
   * Button text to trigger the menu
   */
  triggerText?: string;

  /**
   * Button variant for the trigger
   */
  triggerVariant?: 'primary' | 'secondary' | 'ghost' | 'outline';

  /**
   * Initial book format selection
   */
  initialFormat?: BookFormat;

  /**
   * Where the menu is being opened from (for analytics)
   */
  originSection?: 'hero' | 'footer' | 'bonus';

  /**
   * Custom className for the trigger button
   */
  className?: string;
}

/**
 * RetailerMenu - Retailer selection dialog with format and geo switching
 *
 * Displays available retailers filtered by geographic region and book format.
 * Tracks analytics events for menu opens, format toggles, region switches,
 * and pre-order clicks.
 *
 * @example
 * ```tsx
 * <RetailerMenu
 *   triggerText="Pre-order Now"
 *   triggerVariant="primary"
 *   originSection="hero"
 * />
 * ```
 */
export function RetailerMenu({
  triggerText = 'Pre-order Now',
  triggerVariant = 'primary',
  initialFormat = 'hardcover',
  originSection = 'hero',
  className,
}: RetailerMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState<BookFormat>(initialFormat);
  const [selectedGeo, setSelectedGeo] = React.useState<GeoRegion>('US');

  // Detect user's geo on mount
  React.useEffect(() => {
    const geo = detectUserGeo();
    setSelectedGeo(geo);
  }, []);

  // Get retailers for current geo
  const retailers = React.useMemo(
    () => getDefaultRetailers(selectedGeo),
    [selectedGeo]
  );

  // Filter retailers by selected format
  const availableRetailers = React.useMemo(
    () => retailers.filter((retailer) => retailer.formats.includes(selectedFormat)),
    [retailers, selectedFormat]
  );

  // Track menu open
  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);

      if (isOpen) {
        trackEvent({
          event: 'retailer_menu_open',
          origin_section: originSection,
        });
      }
    },
    [originSection]
  );

  // Handle format toggle
  const handleFormatChange = React.useCallback(
    (format: BookFormat) => {
      const previousFormat = selectedFormat;
      setSelectedFormat(format);

      trackEvent({
        event: 'format_toggle',
        from_format: previousFormat,
        to_format: format,
      });
    },
    [selectedFormat]
  );

  // Handle geo region switch
  const handleGeoChange = React.useCallback(
    (geo: GeoRegion) => {
      const previousGeo = selectedGeo;
      setSelectedGeo(geo);
      saveGeoPreference(geo);

      trackEvent({
        event: 'region_switch',
        from_region: previousGeo,
        to_region: geo,
      });
    },
    [selectedGeo]
  );

  // Handle retailer click
  const handleRetailerClick = React.useCallback(
    (retailer: Retailer) => {
      const url = getRetailerUrl(retailer.id, selectedFormat);

      trackEvent({
        event: 'preorder_click',
        retailer: retailer.id,
        format: selectedFormat,
        geo: selectedGeo,
      });

      // Open retailer URL in new tab
      window.open(url, '_blank', 'noopener,noreferrer');

      // Close dialog
      setOpen(false);
    },
    [selectedFormat, selectedGeo]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <CTAButton
          ctaId={`retailer-menu-${originSection}`}
          variant={triggerVariant}
          className={className}
        >
          {triggerText}
          <ChevronDown className="ml-2 size-4" />
        </CTAButton>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-neutral-950">
        <DialogHeader>
          <DialogTitle className="text-2xl font-outfit text-black dark:text-white">Choose Your Retailer</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Select your preferred format and region to see available retailers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Individual Formats */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Individual Formats
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Individual format selection">
              {getIndividualFormats().map((format) => (
                <button
                  key={format}
                  onClick={() => handleFormatChange(format)}
                  className={cn(
                    'px-4 py-2 rounded-none text-sm font-medium font-outfit transition-all',
                    'border-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2',
                    'flex flex-col items-start',
                    selectedFormat === format
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'bg-background text-foreground border-border hover:border-black dark:hover:border-white'
                  )}
                  aria-pressed={selectedFormat === format}
                >
                  <span>{formatDisplayName(format)}</span>
                  <span className={cn(
                    "text-xs font-normal mt-0.5",
                    selectedFormat === format
                      ? "text-white/80 dark:text-black/80"
                      : "text-muted-foreground"
                  )}>
                    {getFormattedPrice(format, selectedGeo)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bundle Options */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Complete Bundles <span className="text-xs text-slate-500 dark:text-slate-500">(Save up to 25%)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2" role="group" aria-label="Bundle format selection">
              {getBundleFormats().map((format) => {
                const bundleFormat = format as 'bundle-hardcover' | 'bundle-paperback';
                const savingsPercent = getBundleSavingsPercentage(bundleFormat, selectedGeo);
                return (
                  <button
                    key={format}
                    onClick={() => handleFormatChange(format)}
                    className={cn(
                      'px-4 py-3 rounded-none text-left font-outfit transition-all',
                      'border-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2',
                      selectedFormat === format
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'bg-background text-foreground border-border hover:border-black dark:hover:border-white'
                    )}
                    aria-pressed={selectedFormat === format}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-semibold text-sm">
                        {formatDisplayName(format)}
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={cn(
                          "font-semibold text-sm",
                          selectedFormat === format
                            ? "text-white dark:text-black"
                            : "text-foreground"
                        )}>
                          {getFormattedPrice(format, selectedGeo)}
                        </span>
                        <span className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded",
                          selectedFormat === format
                            ? "bg-green-500 text-white"
                            : "bg-green-500/10 text-green-600 dark:text-green-400"
                        )}>
                          Save {savingsPercent}%
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "text-xs",
                      selectedFormat === format
                        ? "text-white/80 dark:text-black/80"
                        : "text-muted-foreground"
                    )}>
                      {getBundleDescription(format)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Selector */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Globe className="size-4" />
              Your Region
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Geographic region selection">
              {getAllRegions().map((region) => (
                <button
                  key={region}
                  onClick={() => handleGeoChange(region)}
                  className={cn(
                    'px-3 py-1.5 rounded-none text-xs font-medium transition-all',
                    'border focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2',
                    selectedGeo === region
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'bg-background text-foreground border-border hover:border-black dark:hover:border-white'
                  )}
                  aria-pressed={selectedGeo === region}
                >
                  {getRegionDisplayName(region)}
                </button>
              ))}
            </div>
          </div>

          {/* Retailer List */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Available Retailers
            </div>

            {availableRetailers.length > 0 ? (
              <div className="grid gap-3">
                {availableRetailers.map((retailer) => (
                  <button
                    key={retailer.id}
                    onClick={() => handleRetailerClick(retailer)}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-none border border-slate-200 dark:border-slate-800 transition-all',
                      'hover:border-black dark:hover:border-white hover:bg-slate-50 dark:hover:bg-slate-900',
                      'focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Retailer Logo Placeholder */}
                      <div className="w-12 h-12 rounded-none border border-slate-300 dark:border-slate-700 bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {retailer.name.charAt(0)}
                      </div>

                      <div className="text-left">
                        <div className="font-semibold font-outfit text-base text-black dark:text-white">
                          {retailer.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {formatDisplayName(selectedFormat)} • {getFormattedPrice(selectedFormat, selectedGeo)}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetailerClick(retailer);
                      }}
                    >
                      Pre-order
                      <ExternalLink className="size-3" />
                    </Button>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                <p>No retailers available for {formatDisplayName(selectedFormat)} in {getRegionDisplayName(selectedGeo)}.</p>
                <p className="text-sm mt-2">Try selecting a different format or region.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
