/**
 * Next.js Instrumentation File
 *
 * This file is automatically loaded by Next.js when the server starts
 * and when edge functions are initialized. It's the recommended place
 * to initialize monitoring tools like Sentry and OpenTelemetry.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side or edge runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import server-side Sentry configuration
    await import('./sentry.server.config');

    // Import OpenTelemetry instrumentation
    const { registerOTel } = await import('./instrumentation.node');
    await registerOTel();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import edge runtime Sentry configuration
    await import('./sentry.edge.config');
  }
}
