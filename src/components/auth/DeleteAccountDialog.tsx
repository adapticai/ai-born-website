/**
 * Delete Account Dialog Component
 *
 * GDPR-compliant account deletion confirmation dialog with:
 * - Explicit confirmation requirement (type "DELETE")
 * - Clear warnings about data loss
 * - 30-day grace period information
 * - Explanation of what's deleted vs. kept
 * - Accessible and user-friendly design
 *
 * Features:
 * - Multi-step confirmation process
 * - Input validation
 * - Loading states
 * - Error handling
 * - Toast notifications
 * - Brand design system integration
 *
 * @module components/auth/DeleteAccountDialog
 */

"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle, Info } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Props for DeleteAccountDialog
 */
export interface DeleteAccountDialogProps {
  /**
   * Trigger element (usually a button)
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback after successful deletion
   */
  onDeleteSuccess?: () => void;
}

/**
 * DeleteAccountDialog Component
 *
 * Renders a confirmation dialog for account deletion with GDPR compliance
 */
export function DeleteAccountDialog({
  children,
  className,
  onDeleteSuccess,
}: DeleteAccountDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmationText, setConfirmationText] = React.useState("");
  const [reason, setReason] = React.useState("");

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setConfirmationText("");
      setReason("");
      setIsDeleting(false);
    }
  }, [open]);

  /**
   * Validate confirmation text
   */
  const isConfirmationValid = confirmationText === "DELETE";

  /**
   * Handle account deletion
   */
  async function handleDeleteAccount() {
    if (!isConfirmationValid) {
      toast.error("Invalid confirmation", {
        description: 'Please type "DELETE" to confirm',
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmation: "DELETE",
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      // Show success message
      toast.success("Account deletion initiated", {
        description:
          "You have 30 days to recover your account. A confirmation email has been sent.",
        duration: 5000,
      });

      // Close dialog
      setOpen(false);

      // Call success callback
      onDeleteSuccess?.();

      // Sign out after brief delay (allow toast to be seen)
      setTimeout(() => {
        signOut({ callbackUrl: "/?deleted=true" });
      }, 1500);
    } catch (error) {
      console.error("Account deletion error:", error);

      toast.error("Failed to delete account", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again or contact support.",
      });

      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive" className={cn("w-full", className)}>
            <Trash2 />
            Delete account
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">
                Delete your account?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                This action has significant consequences
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Box */}
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-red-900 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Warning: Permanent data loss
            </h4>
            <p className="text-sm text-red-800 dark:text-red-300">
              Account deletion is permanent after 30 days. During this grace
              period, you can contact support to recover your account.
            </p>
          </div>

          {/* What will be deleted */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-semibold">
              <Trash2 className="h-4 w-4 text-red-600" />
              What will be deleted:
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-red-500">•</span>
                <span>
                  Your profile information (name, email, preferences)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-red-500">•</span>
                <span>
                  All entitlements and access to downloadable content
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-red-500">•</span>
                <span>Newsletter subscription and communication preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-red-500">•</span>
                <span>Organisation memberships and shared plans</span>
              </li>
            </ul>
          </div>

          {/* What will be kept */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-blue-600" />
              What will be kept (anonymized):
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">•</span>
                <span>
                  Purchase history for accounting and legal compliance
                  (disassociated from your identity)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-500">•</span>
                <span>
                  Receipt verification records (anonymized, for fraud
                  prevention)
                </span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              This complies with GDPR Article 17 (Right to Erasure) while
              maintaining necessary legal and accounting records.
            </p>
          </div>

          {/* 30-Day Grace Period */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-400">
              <Info className="h-4 w-4" />
              30-day recovery period
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Your account will be soft-deleted immediately, but you have 30
              days to contact support and request account recovery. After 30
              days, all personal data will be permanently removed.
            </p>
          </div>

          {/* Optional Reason */}
          <div className="space-y-2">
            <Label htmlFor="deletion-reason" className="text-sm font-medium">
              Reason for leaving (optional)
            </Label>
            <textarea
              id="deletion-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Help us improve by sharing why you're leaving..."
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDeleting}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmation-input" className="text-sm font-medium">
              Type <code className="rounded bg-muted px-1 py-0.5 text-sm font-mono">DELETE</code> to confirm
            </Label>
            <Input
              id="confirmation-input"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
              placeholder="Type DELETE here"
              className={cn(
                "font-mono uppercase",
                confirmationText && !isConfirmationValid && "border-red-500"
              )}
              disabled={isDeleting}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Please type "DELETE" exactly as shown
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isDeleting} className="min-w-24">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }}
            disabled={!isConfirmationValid || isDeleting}
            className="min-w-24 bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete account
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
