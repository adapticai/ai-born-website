'use client';

/**
 * Admin Codes Client Component
 *
 * Client-side UI for VIP code management.
 * Authentication is handled server-side via session cookies.
 * No bearer tokens needed - uses credentials: 'include' for session auth.
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

type CodeType = 'VIP_PREVIEW' | 'VIP_BONUS' | 'VIP_LAUNCH' | 'PARTNER' | 'MEDIA' | 'INFLUENCER';
type CodeStatus = 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'REVOKED';

interface Code {
  id: string;
  code: string;
  type: CodeType;
  status: CodeStatus;
  description: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  validFrom: string;
  validUntil: string | null;
  createdBy: string | null;
  createdAt: string;
  org?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface CodeStatistics {
  totalCodes: number;
  activeCount: number;
  redeemedCount: number;
  expiredCount: number;
  revokedCount: number;
  totalRedemptions: number;
  redemptionRate: number;
}

interface AdminCodesClientProps {
  adminEmail: string;
}

export default function AdminCodesClient({ adminEmail }: AdminCodesClientProps) {
  const [codes, setCodes] = useState<Code[]>([]);
  const [stats, setStats] = useState<CodeStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterType, setFilterType] = useState<CodeType | ''>('');
  const [filterStatus, setFilterStatus] = useState<CodeStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Generation form
  const [genCount, setGenCount] = useState(10);
  const [genType, setGenType] = useState<CodeType>('VIP_PREVIEW');
  const [genDescription, setGenDescription] = useState('');
  const [genMaxRedemptions, setGenMaxRedemptions] = useState(1);
  const [genValidUntil, setGenValidUntil] = useState('');
  const [generating, setGenerating] = useState(false);

  // Load codes
  const loadCodes = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        includeStats: 'true',
      });

      if (filterType) params.set('type', filterType);
      if (filterStatus) params.set('status', filterStatus);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/codes/list?${params}`, {
        credentials: 'include', // Include session cookies
      });

      if (!response.ok) {
        throw new Error('Failed to load codes');
      }

      const data = await response.json();
      setCodes(data.data.codes);
      setTotalPages(data.data.pagination.totalPages);
      if (data.data.stats) {
        setStats(data.data.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Generate codes
  const generateCodes = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          count: genCount,
          type: genType,
          description: genDescription || undefined,
          maxRedemptions: genMaxRedemptions,
          validUntil: genValidUntil || undefined,
          format: 'json',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate codes');
      }

      const data = await response.json();
      alert(`Successfully generated ${data.count} codes!`);

      // Reload codes
      await loadCodes();

      // Reset form
      setGenCount(10);
      setGenDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  };

  // Export to CSV
  const exportCsv = async () => {
    try {
      const response = await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          count: genCount,
          type: genType,
          description: genDescription || undefined,
          maxRedemptions: genMaxRedemptions,
          validUntil: genValidUntil || undefined,
          format: 'csv',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export codes');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vip-codes-${genType}-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    loadCodes();
  }, [page, filterType, filterStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-brand-obsidian p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-brand-porcelain mb-2 text-3xl font-bold">
            VIP Code Management
          </h1>
          <Text className="text-brand-porcelain/70">
            Generate and manage VIP access codes • Logged in as {adminEmail}
          </Text>
        </div>

        {/* Error */}
        {error && (
          <Card className="p-4 bg-red-500/10 border-red-500/20">
            <Text className="text-red-400">{error}</Text>
          </Card>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-white/5 border-white/10">
              <Text className="text-brand-porcelain/70 text-sm mb-1">Total Codes</Text>
              <h3 className="text-brand-porcelain text-xl font-semibold">
                {stats.totalCodes.toLocaleString()}
              </h3>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10">
              <Text className="text-brand-porcelain/70 text-sm mb-1">Active</Text>
              <h3 className="text-brand-cyan text-xl font-semibold">
                {stats.activeCount.toLocaleString()}
              </h3>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10">
              <Text className="text-brand-porcelain/70 text-sm mb-1">Total Redemptions</Text>
              <h3 className="text-brand-ember text-xl font-semibold">
                {stats.totalRedemptions.toLocaleString()}
              </h3>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10">
              <Text className="text-brand-porcelain/70 text-sm mb-1">Redemption Rate</Text>
              <h3 className="text-brand-porcelain text-xl font-semibold">
                {stats.redemptionRate.toFixed(1)}%
              </h3>
            </Card>
          </div>
        )}

        {/* Generation Form */}
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-brand-porcelain mb-4 text-xl font-semibold">
            Generate New Codes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="genCount" className="text-brand-porcelain">
                Count
              </Label>
              <Input
                id="genCount"
                type="number"
                min={1}
                max={10000}
                value={genCount}
                onChange={(e) => setGenCount(parseInt(e.target.value))}
                className="mt-2 bg-white/10 border-white/20 text-brand-porcelain"
              />
            </div>
            <div>
              <Label htmlFor="genType" className="text-brand-porcelain">
                Type
              </Label>
              <select
                id="genType"
                value={genType}
                onChange={(e) => setGenType(e.target.value as CodeType)}
                className="mt-2 w-full h-10 px-3 rounded-md bg-white/10 border border-white/20 text-brand-porcelain"
              >
                <option value="VIP_PREVIEW">VIP Preview</option>
                <option value="VIP_BONUS">VIP Bonus</option>
                <option value="VIP_LAUNCH">VIP Launch</option>
                <option value="PARTNER">Partner</option>
                <option value="MEDIA">Media</option>
                <option value="INFLUENCER">Influencer</option>
              </select>
            </div>
            <div>
              <Label htmlFor="genMaxRedemptions" className="text-brand-porcelain">
                Max Redemptions
              </Label>
              <Input
                id="genMaxRedemptions"
                type="number"
                min={1}
                value={genMaxRedemptions}
                onChange={(e) => setGenMaxRedemptions(parseInt(e.target.value))}
                className="mt-2 bg-white/10 border-white/20 text-brand-porcelain"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="genDescription" className="text-brand-porcelain">
                Description (optional)
              </Label>
              <Input
                id="genDescription"
                value={genDescription}
                onChange={(e) => setGenDescription(e.target.value)}
                className="mt-2 bg-white/10 border-white/20 text-brand-porcelain"
                placeholder="e.g., Launch week partners"
              />
            </div>
            <div>
              <Label htmlFor="genValidUntil" className="text-brand-porcelain">
                Valid Until (optional)
              </Label>
              <Input
                id="genValidUntil"
                type="datetime-local"
                value={genValidUntil}
                onChange={(e) => setGenValidUntil(e.target.value)}
                className="mt-2 bg-white/10 border-white/20 text-brand-porcelain"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateCodes}
              disabled={generating}
              className="bg-brand-cyan hover:bg-brand-cyan/90 text-brand-obsidian"
            >
              {generating ? 'Generating...' : 'Generate Codes'}
            </Button>
            <Button
              onClick={exportCsv}
              disabled={generating}
              variant="outline"
              className="border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10"
            >
              Generate & Export CSV
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <Card className="p-6 bg-white/5 border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-brand-porcelain">
                Search Code
              </Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2 bg-white/10 border-white/20 text-brand-porcelain"
                placeholder="Enter code..."
              />
            </div>
            <div>
              <Label htmlFor="filterType" className="text-brand-porcelain">
                Filter by Type
              </Label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as CodeType | '')}
                className="mt-2 w-full h-10 px-3 rounded-md bg-white/10 border border-white/20 text-brand-porcelain"
              >
                <option value="">All Types</option>
                <option value="VIP_PREVIEW">VIP Preview</option>
                <option value="VIP_BONUS">VIP Bonus</option>
                <option value="VIP_LAUNCH">VIP Launch</option>
                <option value="PARTNER">Partner</option>
                <option value="MEDIA">Media</option>
                <option value="INFLUENCER">Influencer</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filterStatus" className="text-brand-porcelain">
                Filter by Status
              </Label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CodeStatus | '')}
                className="mt-2 w-full h-10 px-3 rounded-md bg-white/10 border border-white/20 text-brand-porcelain"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="REDEEMED">Redeemed</option>
                <option value="EXPIRED">Expired</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Codes List */}
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-brand-porcelain mb-4 text-xl font-semibold">
            Codes
          </h3>
          {loading ? (
            <Text className="text-brand-porcelain/70">Loading...</Text>
          ) : codes.length === 0 ? (
            <Text className="text-brand-porcelain/70">No codes found</Text>
          ) : (
            <div className="space-y-4">
              {codes.map((code) => (
                <Card key={code.id} className="p-4 bg-white/5 border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-bold text-brand-cyan">
                          {code.code}
                        </code>
                        <Badge variant={code.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {code.status}
                        </Badge>
                        <Badge variant="outline">{code.type}</Badge>
                      </div>
                      {code.description && (
                        <Text className="text-brand-porcelain/70 text-sm">
                          {code.description}
                        </Text>
                      )}
                      <div className="flex gap-4 text-sm text-brand-porcelain/50">
                        <span>Redemptions: {code.redemptionCount}{code.maxRedemptions ? ` / ${code.maxRedemptions}` : ''}</span>
                        <span>Created: {new Date(code.createdAt).toLocaleDateString()}</span>
                        {code.validUntil && (
                          <span>Expires: {new Date(code.validUntil).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outline"
                className="border-white/20 text-brand-porcelain"
              >
                Previous
              </Button>
              <Text className="text-brand-porcelain px-4 py-2">
                Page {page} of {totalPages}
              </Text>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                variant="outline"
                className="border-white/20 text-brand-porcelain"
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
