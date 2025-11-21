/**
 * Press Kit Utility Functions
 * Helper functions for press kit asset management
 */

import { PressKitManifest, PressKitAsset } from '@/types/presskit';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Get the full press kit manifest with all assets
 */
export function getPressKitManifest(): PressKitManifest {
  return {
    documents: [
      {
        path: 'press-kit/synopsis.txt',
        filename: 'AI-Born_Synopsis.txt',
        description: 'One-page book synopsis',
      },
      {
        path: 'press-kit/press-release.txt',
        filename: 'AI-Born_Press-Release.txt',
        description: 'Official press release',
      },
      {
        path: 'press-kit/chapter-list.txt',
        filename: 'AI-Born_Chapter-List.txt',
        description: 'Complete chapter list',
      },
      {
        path: 'press-kit/excerpts.txt',
        filename: 'AI-Born_Selected-Excerpts.txt',
        description: 'Selected book excerpts',
      },
      {
        path: 'press-kit/interview-topics.txt',
        filename: 'AI-Born_Interview-Topics.txt',
        description: 'Suggested interview topics',
      },
    ],
    images: [
      {
        path: 'press-kit/cover-art/cover-high-res.png',
        filename: 'Cover-Art/AI-Born_Cover_High-Res.png',
        description: 'High-resolution book cover',
      },
      {
        path: 'press-kit/cover-art/cover-3d-hardcover.png',
        filename: 'Cover-Art/AI-Born_3D-Hardcover.png',
        description: '3D hardcover mockup',
      },
      {
        path: 'press-kit/cover-art/cover-3d-ebook.jpg',
        filename: 'Cover-Art/AI-Born_3D-eBook.jpg',
        description: '3D eBook mockup',
      },
    ],
    logos: [
      {
        path: 'press-kit/logos/ai-born-logo.svg',
        filename: 'Logos/AI-Born_Logo.svg',
        description: 'AI-Born logo (SVG)',
      },
      {
        path: 'press-kit/logos/adaptic-logo.svg',
        filename: 'Logos/Adaptic_Logo.svg',
        description: 'Adaptic.ai logo (SVG)',
      },
    ],
  };
}

/**
 * Validate that an asset exists in the filesystem
 */
export function validateAsset(asset: PressKitAsset, publicDir: string): boolean {
  const fullPath = path.join(publicDir, asset.path);
  return fs.existsSync(fullPath);
}

/**
 * Get available assets (filter out missing files)
 */
export function getAvailableAssets(manifest: PressKitManifest, publicDir: string): PressKitManifest {
  return {
    documents: manifest.documents.filter((asset) => validateAsset(asset, publicDir)),
    images: manifest.images.filter((asset) => validateAsset(asset, publicDir)),
    logos: manifest.logos.filter((asset) => validateAsset(asset, publicDir)),
  };
}

/**
 * Get total count of assets in manifest
 */
export function getAssetCount(manifest: PressKitManifest): number {
  return manifest.documents.length + manifest.images.length + manifest.logos.length;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
