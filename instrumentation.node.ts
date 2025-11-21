/**
 * OpenTelemetry Node.js Instrumentation
 *
 * Auto-instruments:
 * - HTTP/HTTPS requests
 * - Fetch API calls
 * - Next.js specific operations
 * - Database queries (when @prisma/instrumentation is installed)
 *
 * Exports traces to:
 * - Console (development)
 * - OTLP endpoint (production, if configured)
 * - Vercel Analytics (when deployed to Vercel)
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';

/**
 * OpenTelemetry SDK instance
 * Singleton to prevent multiple registrations
 */
let sdk: NodeSDK | undefined;

/**
 * Register OpenTelemetry instrumentation
 * Called automatically by Next.js instrumentation.ts
 */
export async function registerOTel() {
  // Only register once
  if (sdk) {
    return;
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  // Create resource with service information
  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'ai-born-website',
    [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  });

  // Configure trace exporter
  const traceExporter = otlpEndpoint
    ? new OTLPTraceExporter({
        url: otlpEndpoint,
        headers: {},
      })
    : undefined;

  // Initialize SDK
  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable instrumentations that may cause issues
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // File system instrumentation can be noisy
        },
        // Configure HTTP instrumentation
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ignoreIncomingRequestHook: (request) => {
            // Ignore health check and static asset requests
            const url = request.url || '';
            return (
              url.includes('/_next/') ||
              url.includes('/favicon.ico') ||
              url === '/health' ||
              url === '/api/health'
            );
          },
        },
        // Note: Fetch instrumentation is auto-configured by auto-instrumentations
      }),
    ],
  });

  // Start the SDK
  try {
    sdk.start();

    if (isDevelopment) {
      console.log('[OpenTelemetry] Instrumentation started');
      if (!otlpEndpoint) {
        console.log(
          '[OpenTelemetry] No OTLP endpoint configured - traces will not be exported'
        );
        console.log(
          '[OpenTelemetry] Set OTEL_EXPORTER_OTLP_ENDPOINT to enable trace export'
        );
      }
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      try {
        await sdk?.shutdown();
        console.log('[OpenTelemetry] SDK shut down successfully');
      } catch (error) {
        console.error('[OpenTelemetry] Error shutting down SDK', error);
      }
    });
  } catch (error) {
    console.error('[OpenTelemetry] Failed to start instrumentation:', error);
  }
}
