'use client';

import { useState, useEffect } from 'react';
import {
  getAllExperiments,
  getExperiment,
  type ExperimentId,
  ConversionEvents,
} from '@/config/experiments';
import {
  type Experiment,
  type VariantMetrics,
  type SignificanceResult,
  calculateVariantMetrics,
  calculateSignificance,
  getAllAssignments,
  forceVariant,
  clearAllAssignments,
} from '@/lib/ab-testing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ==================== Types ====================

interface ExperimentStats {
  experimentId: string;
  variantMetrics: VariantMetrics[];
  significance: SignificanceResult;
  totalParticipants: number;
  totalConversions: number;
}

// ==================== Main Component ====================

interface ExperimentsAdminClientProps {
  adminEmail: string;
}

export default function ExperimentsAdminClient({ adminEmail }: ExperimentsAdminClientProps) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [experimentStats, setExperimentStats] = useState<ExperimentStats | null>(null);
  const [assignments, setAssignments] = useState(0);

  // Load experiments on mount
  useEffect(() => {
    const allExperiments = getAllExperiments();
    setExperiments(allExperiments);

    // Count assignments
    const allAssignments = getAllAssignments();
    setAssignments(allAssignments.size);
  }, []);

  // Load stats for selected experiment
  useEffect(() => {
    if (!selectedExperiment) {
      setExperimentStats(null);
      return;
    }

    // In production, fetch stats from analytics API
    // For now, generate mock data for demonstration
    const stats = generateMockStats(selectedExperiment);
    setExperimentStats(stats);
  }, [selectedExperiment]);

  const handleForceVariant = (experimentId: string, variantId: string) => {
    const experiment = getExperiment(experimentId);
    if (!experiment) return;

    const variant = experiment.variants.find(v => v.id === variantId);
    if (!variant) return;

    forceVariant(experimentId, variantId, variant.name);
    alert(`Forced variant ${variantId} for experiment ${experimentId}`);
    window.location.reload();
  };

  const handleClearAssignments = () => {
    if (confirm('Clear all experiment assignments? This will reset all users to new variants.')) {
      clearAllAssignments();
      setAssignments(0);
      alert('All assignments cleared');
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">A/B Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and analyze experiments for the AI-Born landing page
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Active Assignments:</span> {assignments}
          </div>
          <Button variant="outline" size="sm" onClick={handleClearAssignments}>
            Clear All Assignments
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Experiments List */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-2xl font-semibold">Experiments</h2>
          <div className="space-y-3">
            {experiments.map((experiment) => (
              <Card
                key={experiment.id}
                className={`cursor-pointer p-4 transition-colors hover:bg-accent ${
                  selectedExperiment === experiment.id ? 'border-primary bg-accent' : ''
                }`}
                onClick={() => setSelectedExperiment(experiment.id)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold">{experiment.name}</h3>
                  <StatusBadge active={experiment.active} />
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{experiment.description}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{experiment.variants.length} variants</span>
                  <span>•</span>
                  <span>{(experiment.trafficAllocation || 1) * 100}% traffic</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Experiment Details */}
        <div className="lg:col-span-2">
          {selectedExperiment ? (
            <ExperimentDetails
              experimentId={selectedExperiment}
              stats={experimentStats}
              onForceVariant={handleForceVariant}
            />
          ) : (
            <Card className="flex h-64 items-center justify-center p-8">
              <p className="text-muted-foreground">Select an experiment to view details</p>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <Card className="mt-8 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Conversion Events Reference</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(ConversionEvents).map(([key, value]) => (
            <div key={key} className="rounded-lg border p-3">
              <code className="text-sm font-mono">{value}</code>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ==================== Sub-components ====================

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        active
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function ExperimentDetails({
  experimentId,
  stats,
  onForceVariant,
}: {
  experimentId: string;
  stats: ExperimentStats | null;
  onForceVariant: (experimentId: string, variantId: string) => void;
}) {
  const experiment = getExperiment(experimentId);

  if (!experiment) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">Experiment not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <h2 className="mb-2 text-2xl font-bold">{experiment.name}</h2>
        <p className="mb-4 text-muted-foreground">{experiment.description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="font-medium">Status:</span>{' '}
            {experiment.active ? 'Active' : 'Inactive'}
          </div>
          <div>
            <span className="font-medium">Traffic:</span>{' '}
            {(experiment.trafficAllocation || 1) * 100}%
          </div>
          <div>
            <span className="font-medium">Variants:</span> {experiment.variants.length}
          </div>
        </div>
      </Card>

      {/* Variants */}
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Variants</h3>
        <div className="space-y-4">
          {experiment.variants.map((variant) => {
            const variantStats = stats?.variantMetrics.find((v) => v.variantId === variant.id);

            return (
              <div key={variant.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">
                      Variant {variant.id}: {variant.name}
                    </h4>
                    {variant.description && (
                      <p className="text-sm text-muted-foreground">{variant.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onForceVariant(experimentId, variant.id)}
                  >
                    Force
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <div className="text-muted-foreground">Weight</div>
                    <div className="font-medium">{(variant.weight * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Participants</div>
                    <div className="font-medium">{variantStats?.participants || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Conversions</div>
                    <div className="font-medium">{variantStats?.conversions || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Conv. Rate</div>
                    <div className="font-medium">
                      {variantStats
                        ? (variantStats.conversionRate * 100).toFixed(2)
                        : '0.00'}
                      %
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Statistical Significance */}
      {stats && (
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Statistical Analysis</h3>

          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Total Participants</div>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Total Conversions</div>
              <div className="text-2xl font-bold">{stats.totalConversions}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Overall Conv. Rate</div>
              <div className="text-2xl font-bold">
                {stats.totalParticipants > 0
                  ? ((stats.totalConversions / stats.totalParticipants) * 100).toFixed(2)
                  : '0.00'}
                %
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg border p-4 ${
              stats.significance.isSignificant
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-gray-300'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold">Significance Test</h4>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  stats.significance.isSignificant
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {stats.significance.isSignificant ? 'Significant' : 'Not Significant'}
              </span>
            </div>

            <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-muted-foreground">Confidence Level</div>
                <div className="font-medium">{stats.significance.confidence}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Chi-Squared</div>
                <div className="font-medium">{stats.significance.chiSquared.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">P-Value</div>
                <div className="font-medium">{stats.significance.pValue.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Degrees of Freedom</div>
                <div className="font-medium">{stats.significance.degreesOfFreedom}</div>
              </div>
            </div>

            {stats.significance.isSignificant && stats.significance.winningVariant && (
              <div className="mt-4 rounded-lg bg-white p-3 dark:bg-gray-900">
                <div className="font-semibold">Winner: Variant {stats.significance.winningVariant}</div>
                <div className="text-sm text-muted-foreground">
                  Improvement: {stats.significance.improvement?.toFixed(2)}% over control
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="mb-3 text-xl font-semibold">Testing Instructions</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Force Variant:</strong> Click &quot;Force&quot; to test a specific variant. This
            will override the automatic assignment for your browser.
          </p>
          <p>
            <strong>Clear Assignments:</strong> Use the &quot;Clear All Assignments&quot; button to
            reset all users to new variant assignments.
          </p>
          <p>
            <strong>View in GTM:</strong> All experiment events are tracked in Google Tag Manager
            under <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">experiment_assigned</code> and{' '}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">experiment_conversion</code>.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ==================== Mock Data Generator ====================

/**
 * Generate mock statistics for demonstration
 * In production, replace with API call to analytics backend
 */
function generateMockStats(experimentId: string): ExperimentStats {
  const experiment = getExperiment(experimentId);

  if (!experiment) {
    return {
      experimentId,
      variantMetrics: [],
      significance: {
        isSignificant: false,
        confidence: 95,
        chiSquared: 0,
        pValue: 1,
        degreesOfFreedom: 0,
      },
      totalParticipants: 0,
      totalConversions: 0,
    };
  }

  // Generate realistic mock data
  const variantMetrics: VariantMetrics[] = experiment.variants.map((variant, index) => {
    // Base participants on variant weight
    const participants = Math.floor(1000 * variant.weight);

    // Vary conversion rates slightly between variants
    const baseRate = 0.12; // 12% base conversion rate
    const variance = index * 0.02; // Each variant differs by 2%
    const conversionRate = baseRate + variance;

    const conversions = Math.floor(participants * conversionRate);

    return calculateVariantMetrics(
      variant.id,
      variant.name,
      participants,
      conversions
    );
  });

  const totalParticipants = variantMetrics.reduce((sum, v) => sum + v.participants, 0);
  const totalConversions = variantMetrics.reduce((sum, v) => sum + v.conversions, 0);

  const significance = calculateSignificance(variantMetrics, 95);

  return {
    experimentId,
    variantMetrics,
    significance,
    totalParticipants,
    totalConversions,
  };
}
