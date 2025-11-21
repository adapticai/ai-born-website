-- Migration: Add deletedAt field to User model
-- Purpose: Enable soft delete with 30-day grace period for account deletion
-- GDPR Compliance: Article 17 - Right to Erasure

-- Add deletedAt column to users table
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Create index for efficient querying of deleted accounts
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt") WHERE "deletedAt" IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN "users"."deletedAt" IS 'Timestamp when account deletion was requested. Null = active account. Non-null = soft-deleted with 30-day grace period.';
