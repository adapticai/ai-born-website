/**
 * Press Kit Types
 * Type definitions for press kit download functionality
 */

export interface PressKitAsset {
  /** Path to the asset relative to public directory */
  path: string;
  /** Filename to use in the ZIP archive */
  filename: string;
  /** Description of the asset */
  description?: string;
}

export interface PressKitManifest {
  documents: PressKitAsset[];
  images: PressKitAsset[];
  logos: PressKitAsset[];
}

export interface PressKitDownloadEvent {
  event: 'presskit_download';
  asset_type: 'full_kit' | 'synopsis' | 'press_release' | 'headshots' | 'cover_art';
  timestamp: string;
  user_agent?: string;
}

export interface PressKitError {
  message: string;
  code: 'ASSET_NOT_FOUND' | 'ZIP_GENERATION_FAILED' | 'INTERNAL_ERROR';
  details?: string;
}
