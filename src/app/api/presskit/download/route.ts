/**
 * Press Kit Download API Route
 *
 * GET /api/presskit/download
 *
 * Generates a ZIP file on-the-fly containing all press kit assets:
 * - Synopsis, press release, chapter list, excerpts, interview topics (PDFs)
 * - High-res cover art in multiple formats
 * - Author headshots (multiple poses)
 * - Logos (SVG, PNG)
 *
 * Features:
 * - Streams ZIP to client for memory efficiency
 * - Analytics tracking via GTM dataLayer
 * - Proper error handling with HTTP status codes
 * - No authentication required (public press kit)
 * - Sets appropriate cache headers
 *
 * Performance:
 * - Streams directly to response (no temp files)
 * - Handles missing assets gracefully
 * - Includes only available assets
 */

import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { Readable } from 'node:stream';
import path from 'node:path';
import fs from 'node:fs';
import { getPressKitManifest, getAvailableAssets, getAssetCount } from '@/lib/presskit';
import type { PressKitAsset, PressKitError } from '@/types/presskit';
import { getCurrentUser } from '@/lib/auth';

// Disable body parsing (we're streaming)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET handler - generates and streams press kit ZIP
 */
export async function GET(request: NextRequest): Promise<Response> {
  const startTime = Date.now();

  try {
    // Get authenticated user for tracking
    const user = await getCurrentUser();
    const isAuthenticated = !!user;

    // Get public directory path
    const publicDir = path.join(process.cwd(), 'public');

    // Get full manifest and filter to available assets
    const fullManifest = getPressKitManifest();
    const manifest = getAvailableAssets(fullManifest, publicDir);

    const totalAssets = getAssetCount(manifest);
    const fullAssets = getAssetCount(fullManifest);

    // Log warning if assets are missing
    if (totalAssets < fullAssets) {
      console.warn(
        `[Press Kit] ${fullAssets - totalAssets} asset(s) not found. Including ${totalAssets} available assets.`
      );
    }

    // If no assets available, return error
    if (totalAssets === 0) {
      const error: PressKitError = {
        message: 'Press kit assets not available',
        code: 'ASSET_NOT_FOUND',
        details: 'No press kit assets found in the expected locations',
      };

      return NextResponse.json(error, { status: 404 });
    }

    // Create archiver instance
    const archive = archiver('zip', {
      zlib: { level: 6 }, // Balanced compression
    });

    // Track errors
    let hasError = false;
    let errorMessage = '';

    archive.on('error', (err) => {
      hasError = true;
      errorMessage = err.message;
      console.error('[Press Kit] Archive error:', err);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('[Press Kit] Archive warning:', err);
      } else {
        hasError = true;
        errorMessage = err.message;
        console.error('[Press Kit] Archive error:', err);
      }
    });

    // Add all available assets to archive
    const allAssets: PressKitAsset[] = [
      ...manifest.documents,
      ...manifest.images,
      ...manifest.logos,
    ];

    for (const asset of allAssets) {
      const filePath = path.join(publicDir, asset.path);

      try {
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: asset.filename });
        }
      } catch (err) {
        console.error(`[Press Kit] Error adding file ${asset.filename}:`, err);
      }
    }

    // Add README.txt with press kit information
    const readmeContent = generateReadmeContent(manifest);
    archive.append(readmeContent, { name: 'README.txt' });

    // Finalize the archive
    await archive.finalize();

    // If error occurred during archiving, return error response
    if (hasError) {
      const error: PressKitError = {
        message: 'Failed to generate press kit',
        code: 'ZIP_GENERATION_FAILED',
        details: errorMessage,
      };

      return NextResponse.json(error, { status: 500 });
    }

    // Convert Node.js Readable stream to Web API ReadableStream
    const nodeStream = archive as unknown as Readable;
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    // Calculate generation time
    const generationTime = Date.now() - startTime;

    // Log success
    console.log(
      `[Press Kit] Generated ZIP with ${totalAssets} assets in ${generationTime}ms`
    );

    // Get user agent for analytics
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Track analytics (log for server-side; client will also track)
    console.log('[Analytics] Press kit download:', {
      event: 'presskit_download',
      asset_type: 'full_kit',
      asset_count: totalAssets,
      generation_time_ms: generationTime,
      timestamp: new Date().toISOString(),
      user_agent: userAgent,
      authenticated: isAuthenticated,
      user_email: user?.email || undefined,
      user_name: user?.name || undefined,
    });

    // Return ZIP stream with appropriate headers
    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="AI-Born_Press-Kit_${new Date().toISOString().split('T')[0]}.zip"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Asset-Count': totalAssets.toString(),
        'X-Generation-Time': `${generationTime}ms`,
      },
    });
  } catch (error) {
    console.error('[Press Kit] Unexpected error:', error);

    const errorResponse: PressKitError = {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Generate README.txt content for press kit
 */
function generateReadmeContent(manifest: ReturnType<typeof getPressKitManifest>): string {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `AI-BORN PRESS KIT
==================

Book Title: AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being
Author: Mehran Granfar
Website: https://ai-born.org

Downloaded: ${date}

CONTENTS
--------

DOCUMENTS:
${manifest.documents.map((asset) => `  - ${asset.filename}: ${asset.description}`).join('\n')}

IMAGES:
${manifest.images.map((asset) => `  - ${asset.filename}: ${asset.description}`).join('\n')}

LOGOS:
${manifest.logos.map((asset) => `  - ${asset.filename}: ${asset.description}`).join('\n')}

USAGE GUIDELINES
----------------

All materials in this press kit are provided for editorial and promotional use only.

For media enquiries, interview requests, or speaking opportunities:
Contact: press@ai-born.org

For high-resolution images or additional materials not included in this kit:
Visit: https://ai-born.org/media

BOOK SYNOPSIS
-------------

When three people can orchestrate what once required 30,000, the enterprise—and human
purpose—must be redesigned from first principles. AI-Born is the blueprint for that
transformation.

This is not another book about AI tools. AI-Born is a field manual for designing
institutions where autonomous agents execute, learn, and adapt—and where humans provide
intent, judgement, and taste. Blending systems architecture with moral philosophy, it
shows how to rebuild the enterprise for an age when three people can orchestrate what
once took thirty thousand.

ABOUT THE AUTHOR
-----------------

Mehran Granfar is Founder & CEO of Adaptic.ai, an AI-born institutional platform fusing
autonomous intelligence with modern finance. A systems architect and strategic futurist,
he works where AI, governance, and economic design meet—helping organisations evolve
from AI-enabled to AI-native.

---

© 2025 Mic Press, LLC. All rights reserved.
`;
}
