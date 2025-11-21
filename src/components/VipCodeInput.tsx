'use client';

/**
 * VIP Code Input Component
 *
 * Allows users to enter and validate VIP codes.
 * Displays code benefits and handles redemption.
 *
 * Usage:
 * <VipCodeInput onValidCode={(code) => handleValidCode(code)} />
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';

type CodeType = 'VIP_PREVIEW' | 'VIP_BONUS' | 'VIP_LAUNCH' | 'PARTNER' | 'MEDIA' | 'INFLUENCER';

interface ValidCodeResult {
  type: CodeType;
  redemptionsRemaining: number | null;
}

interface VipCodeInputProps {
  onValidCode?: (code: string, details: ValidCodeResult) => void;
  className?: string;
}

const CODE_TYPE_LABELS: Record<CodeType, string> = {
  VIP_PREVIEW: 'VIP Preview Access',
  VIP_BONUS: 'VIP Bonus Pack',
  VIP_LAUNCH: 'Launch Event Access',
  PARTNER: 'Partner Access',
  MEDIA: 'Media Access',
  INFLUENCER: 'Influencer Access',
};

const CODE_TYPE_BENEFITS: Record<CodeType, string[]> = {
  VIP_PREVIEW: [
    'Early access to book excerpt',
    'Priority launch notifications',
    'Exclusive insights newsletter',
  ],
  VIP_BONUS: [
    'Enhanced Agent Charter Pack',
    'Cognitive Overhead Index tool',
    'Priority customer support',
  ],
  VIP_LAUNCH: [
    'Launch event access',
    'Live Q&A with author',
    'Digital signed bookplate',
  ],
  PARTNER: [
    'Partner organization benefits',
    'Bulk order coordination',
    'Custom resources',
  ],
  MEDIA: [
    'Review copy access',
    'Press kit download',
    'Interview scheduling',
  ],
  INFLUENCER: [
    'Creator resources',
    'Promotional materials',
    'Affiliate program access',
  ],
};

export function VipCodeInput({ onValidCode, className }: VipCodeInputProps) {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [validCode, setValidCode] = useState<ValidCodeResult | null>(null);

  const formatCodeInput = (value: string): string => {
    // Remove non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Limit to 6 characters
    return cleaned.substring(0, 6);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCodeInput(e.target.value);
    setCode(formatted);
    setError('');
    setValidCode(null);
  };

  const validateCodeHandler = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    setValidating(true);
    setError('');
    setValidCode(null);

    try {
      const response = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate code');
      }

      if (!data.valid) {
        setError(data.error || 'Invalid code');
        return;
      }

      // Valid code
      setValidCode(data.code);

      // Notify parent
      if (onValidCode) {
        onValidCode(code, data.code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate code');
    } finally {
      setValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateCodeHandler();
    }
  };

  return (
    <div className={className}>
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="space-y-4">
          {/* Input Section */}
          <div>
            <Text className="text-brand-porcelain mb-2 font-medium">
              Have a VIP code?
            </Text>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="ABC123"
                maxLength={6}
                className="font-mono text-lg bg-white/10 border-white/20 text-brand-porcelain uppercase"
                disabled={validating || validCode !== null}
              />
              <Button
                onClick={validateCodeHandler}
                disabled={validating || code.length !== 6 || validCode !== null}
                className="bg-brand-cyan hover:bg-brand-cyan/90 text-brand-obsidian px-8"
              >
                {validating ? 'Validating...' : 'Validate'}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <Text className="text-red-400 text-sm">{error}</Text>
            </div>
          )}

          {/* Valid Code Display */}
          {validCode && (
            <div className="p-4 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-cyan rounded-full" />
                <Text className="text-brand-cyan font-semibold">
                  Code Validated
                </Text>
                <Badge className="bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30">
                  {CODE_TYPE_LABELS[validCode.type]}
                </Badge>
              </div>

              <div className="space-y-1">
                <Text className="text-brand-porcelain/70 text-sm font-medium">
                  Your benefits include:
                </Text>
                <ul className="space-y-1 ml-4">
                  {CODE_TYPE_BENEFITS[validCode.type].map((benefit, idx) => (
                    <li key={idx} className="text-brand-porcelain/90 text-sm">
                      • {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {validCode.redemptionsRemaining !== null && (
                <Text className="text-brand-porcelain/50 text-xs">
                  Redemptions remaining: {validCode.redemptionsRemaining}
                </Text>
              )}
            </div>
          )}

          {/* Help Text */}
          {!validCode && !error && (
            <Text className="text-brand-porcelain/50 text-xs">
              Enter your 6-character VIP code to unlock exclusive benefits
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
}

/**
 * Example usage in a page:
 *
 * import { VipCodeInput } from '@/components/VipCodeInput';
 *
 * export default function ExcerptPage() {
 *   const handleValidCode = async (code: string, details: ValidCodeResult) => {
 *     console.log('Valid code:', code, details);
 *
 *     // Redirect to redemption flow
 *     // Grant entitlement
 *     // Show success message
 *   };
 *
 *   return (
 *     <div>
 *       <VipCodeInput onValidCode={handleValidCode} />
 *     </div>
 *   );
 * }
 */
