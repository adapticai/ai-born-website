/**
 * Newsletter Subscription Types
 * GDPR/CCPA Compliant
 */

// ============================================================================
// Newsletter Subscriber
// ============================================================================

export type NewsletterSource =
  | 'hero'
  | 'footer'
  | 'excerpt'
  | 'bonus'
  | 'blog'
  | 'popup'
  | 'other';

export type NewsletterInterest =
  | 'ai-native-org'
  | 'governance'
  | 'agent-architecture'
  | 'defensibility'
  | 'launch-updates'
  | 'speaking-events';

export type SubscriptionStatus =
  | 'pending' // Awaiting confirmation (double opt-in)
  | 'confirmed' // Confirmed and active
  | 'unsubscribed' // User unsubscribed
  | 'bounced' // Email bounced
  | 'complained'; // Spam complaint

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  source: NewsletterSource;
  interests: NewsletterInterest[];
  status: SubscriptionStatus;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Privacy & compliance
  ipAddress?: string;
  userAgent?: string;
  // Token for confirmation/unsubscribe
  confirmationToken?: string;
  unsubscribeToken?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  subscriptionId?: string;
  errors?: Record<string, string[]>;
}

export interface NewsletterConfirmResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface NewsletterUnsubscribeResponse {
  success: boolean;
  message: string;
  email?: string;
}

// ============================================================================
// Database Storage (In-Memory for MVP)
// ============================================================================

/**
 * In-memory storage for newsletter subscribers
 * For production, replace with database (PostgreSQL, MongoDB, etc.)
 */
export class NewsletterStore {
  private static subscribers = new Map<string, NewsletterSubscriber>();

  /**
   * Add or update subscriber
   */
  static upsert(subscriber: NewsletterSubscriber): void {
    this.subscribers.set(subscriber.email, subscriber);
  }

  /**
   * Find subscriber by email
   */
  static findByEmail(email: string): NewsletterSubscriber | undefined {
    return this.subscribers.get(email.toLowerCase());
  }

  /**
   * Find subscriber by confirmation token
   */
  static findByConfirmationToken(
    token: string
  ): NewsletterSubscriber | undefined {
    return Array.from(this.subscribers.values()).find(
      (sub) => sub.confirmationToken === token
    );
  }

  /**
   * Find subscriber by unsubscribe token
   */
  static findByUnsubscribeToken(
    token: string
  ): NewsletterSubscriber | undefined {
    return Array.from(this.subscribers.values()).find(
      (sub) => sub.unsubscribeToken === token
    );
  }

  /**
   * Get all confirmed subscribers
   */
  static getAllConfirmed(): NewsletterSubscriber[] {
    return Array.from(this.subscribers.values()).filter(
      (sub) => sub.status === 'confirmed'
    );
  }

  /**
   * Get subscriber count by status
   */
  static getCountByStatus(status: SubscriptionStatus): number {
    return Array.from(this.subscribers.values()).filter(
      (sub) => sub.status === status
    ).length;
  }

  /**
   * Delete subscriber (GDPR right to erasure)
   */
  static delete(email: string): boolean {
    return this.subscribers.delete(email.toLowerCase());
  }

  /**
   * Export all data for subscriber (GDPR data portability)
   */
  static exportData(email: string): NewsletterSubscriber | undefined {
    return this.findByEmail(email);
  }
}
