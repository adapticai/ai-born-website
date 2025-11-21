/**
 * User Preferences Type Definitions
 *
 * Defines the structure for user preferences stored in the database.
 * These preferences control email notifications, theme, and communication settings.
 *
 * @module types/user
 */

// ============================================================================
// User Preferences Types
// ============================================================================

/**
 * Email notification preferences
 */
export interface EmailNotificationPreferences {
  /** Newsletter subscription (launch updates, free excerpt) */
  newsletter: boolean;
  /** Marketing emails and promotional offers */
  marketingEmails: boolean;
  /** Product updates (book launch, bonuses, new content) */
  productUpdates: boolean;
  /** Weekly digest of updates and news */
  weeklyDigest: boolean;
  /** Bonus pack availability notifications */
  bonusNotifications: boolean;
  /** Launch event invitations */
  launchEvents: boolean;
}

/**
 * Theme preference options
 */
export type ThemePreference = "light" | "dark" | "system";

/**
 * Language preference options
 */
export type LanguagePreference = "en" | "en-GB";

/**
 * Communication channel preferences
 */
export interface CommunicationPreferences {
  /** Preferred communication channel */
  preferredChannel: "email" | "none";
  /** Email frequency */
  emailFrequency: "immediate" | "daily" | "weekly" | "never";
  /** Allow contact from media team */
  mediaContact: boolean;
  /** Allow contact for bulk orders */
  bulkOrderContact: boolean;
}

/**
 * Complete user preferences structure
 */
export interface UserPreferences {
  /** Email notification settings */
  emailNotifications: EmailNotificationPreferences;
  /** Theme preference (light/dark/system) */
  theme: ThemePreference;
  /** Language preference */
  language: LanguagePreference;
  /** Communication preferences */
  communication: CommunicationPreferences;
  /** Last updated timestamp */
  updatedAt?: string;
}

/**
 * Default user preferences
 */
export const defaultUserPreferences: UserPreferences = {
  emailNotifications: {
    newsletter: true,
    marketingEmails: false,
    productUpdates: true,
    weeklyDigest: false,
    bonusNotifications: true,
    launchEvents: true,
  },
  theme: "system",
  language: "en-GB",
  communication: {
    preferredChannel: "email",
    emailFrequency: "weekly",
    mediaContact: false,
    bulkOrderContact: false,
  },
};

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request body for updating user preferences
 */
export interface UpdatePreferencesRequest {
  preferences: Partial<UserPreferences>;
}

/**
 * Response from preferences API endpoints
 */
export interface PreferencesResponse {
  success: boolean;
  preferences: UserPreferences;
  message?: string;
}

/**
 * Error response from preferences API
 */
export interface PreferencesErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Type guard to check if preferences are valid
 */
export function isValidUserPreferences(
  preferences: unknown
): preferences is UserPreferences {
  if (!preferences || typeof preferences !== "object") {
    return false;
  }

  const prefs = preferences as Partial<UserPreferences>;

  // Check required top-level properties
  if (!prefs.emailNotifications || !prefs.theme || !prefs.language || !prefs.communication) {
    return false;
  }

  // Check theme is valid
  if (!["light", "dark", "system"].includes(prefs.theme)) {
    return false;
  }

  // Check language is valid
  if (!["en", "en-GB"].includes(prefs.language)) {
    return false;
  }

  return true;
}

/**
 * Merge partial preferences with existing preferences
 */
export function mergePreferences(
  existing: UserPreferences,
  updates: Partial<UserPreferences>
): UserPreferences {
  return {
    ...existing,
    ...updates,
    emailNotifications: {
      ...existing.emailNotifications,
      ...(updates.emailNotifications || {}),
    },
    communication: {
      ...existing.communication,
      ...(updates.communication || {}),
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Sanitize preferences to ensure they match the schema
 */
export function sanitizePreferences(
  preferences: Partial<UserPreferences>
): UserPreferences {
  return {
    emailNotifications: {
      newsletter: preferences.emailNotifications?.newsletter ?? defaultUserPreferences.emailNotifications.newsletter,
      marketingEmails: preferences.emailNotifications?.marketingEmails ?? defaultUserPreferences.emailNotifications.marketingEmails,
      productUpdates: preferences.emailNotifications?.productUpdates ?? defaultUserPreferences.emailNotifications.productUpdates,
      weeklyDigest: preferences.emailNotifications?.weeklyDigest ?? defaultUserPreferences.emailNotifications.weeklyDigest,
      bonusNotifications: preferences.emailNotifications?.bonusNotifications ?? defaultUserPreferences.emailNotifications.bonusNotifications,
      launchEvents: preferences.emailNotifications?.launchEvents ?? defaultUserPreferences.emailNotifications.launchEvents,
    },
    theme: preferences.theme && ["light", "dark", "system"].includes(preferences.theme)
      ? preferences.theme
      : defaultUserPreferences.theme,
    language: preferences.language && ["en", "en-GB"].includes(preferences.language)
      ? preferences.language
      : defaultUserPreferences.language,
    communication: {
      preferredChannel: preferences.communication?.preferredChannel ?? defaultUserPreferences.communication.preferredChannel,
      emailFrequency: preferences.communication?.emailFrequency ?? defaultUserPreferences.communication.emailFrequency,
      mediaContact: preferences.communication?.mediaContact ?? defaultUserPreferences.communication.mediaContact,
      bulkOrderContact: preferences.communication?.bulkOrderContact ?? defaultUserPreferences.communication.bulkOrderContact,
    },
    updatedAt: new Date().toISOString(),
  };
}
