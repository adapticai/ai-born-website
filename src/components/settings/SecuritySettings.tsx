/**
 * Security Settings Component
 *
 * Allows users to manage their security settings including:
 * - Connected accounts (Google, GitHub)
 * - Active sessions
 * - Account deletion
 *
 * Features:
 * - View and manage connected OAuth providers
 * - Session management
 * - Account deletion with confirmation dialog
 * - Toast notifications
 * - Matches brand design system
 *
 * @module components/settings/SecuritySettings
 */

"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Trash2, LogOut, Github, Mail } from "lucide-react";
import { signOut } from "next-auth/react";
import { User } from "next-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountDialog } from "@/components/auth/DeleteAccountDialog";
import { cn } from "@/lib/utils";

/**
 * Props for SecuritySettings component
 */
export interface SecuritySettingsProps {
  /**
   * User data
   */
  user: User;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Google Icon Component
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/**
 * SecuritySettings Component
 *
 * Displays and allows managing security and authentication settings
 */
export function SecuritySettings({
  user,
  className,
}: SecuritySettingsProps) {
  const [isRevoking, setIsRevoking] = React.useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  /**
   * Handle revoking a connected account
   */
  async function handleRevokeAccount(provider: string) {
    setIsRevoking(provider);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/user/accounts/${provider}`, {
      //   method: "DELETE",
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to revoke account");
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Account disconnected", {
        description: `Your ${provider} account has been disconnected.`,
      });
    } catch (error) {
      toast.error("Failed to disconnect account", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while disconnecting your account.",
      });
    } finally {
      setIsRevoking(null);
    }
  }

  /**
   * Handle logging out all sessions
   */
  async function handleLogoutAllSessions() {
    setIsLoggingOut(true);

    try {
      // TODO: Replace with actual API call to invalidate all sessions
      // const response = await fetch("/api/user/sessions/revoke-all", {
      //   method: "POST",
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to logout all sessions");
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("All sessions logged out", {
        description: "You have been logged out of all devices.",
      });

      // Sign out current session
      await signOut({ callbackUrl: "/auth/signin" });
    } catch (error) {
      toast.error("Failed to logout sessions", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while logging out.",
      });
      setIsLoggingOut(false);
    }
  }

  // Mock connected accounts - in production, fetch from API
  const connectedAccounts = [
    {
      provider: "google",
      email: user.email,
      icon: GoogleIcon,
      connected: true,
    },
    {
      provider: "github",
      email: null,
      icon: Github,
      connected: false,
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security and connected services.
        </p>
      </div>

      {/* Connected Accounts Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected Accounts</CardTitle>
          <CardDescription>
            Manage your linked authentication providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedAccounts.map((account) => (
            <div
              key={account.provider}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <account.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {account.provider}
                  </p>
                  {account.connected && account.email && (
                    <p className="text-sm text-muted-foreground">
                      {account.email}
                    </p>
                  )}
                  {!account.connected && (
                    <p className="text-sm text-muted-foreground">
                      Not connected
                    </p>
                  )}
                </div>
              </div>

              {account.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeAccount(account.provider)}
                  disabled={isRevoking === account.provider}
                >
                  {isRevoking === account.provider ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect"
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info("Coming soon", {
                      description: `Connect your ${account.provider} account in a future update.`,
                    });
                  }}
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Session Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">Current Session</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This device • Active now
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogoutAllSessions}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut />
                Log out all other sessions
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            This will log you out on all devices except this one. You will need
            to sign in again on those devices.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog>
            <Button variant="destructive" className="w-full">
              <Trash2 />
              Delete account
            </Button>
          </DeleteAccountDialog>

          <p className="mt-3 text-xs text-muted-foreground">
            Once you delete your account, there is no going back. You have 30
            days to recover your account after deletion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
