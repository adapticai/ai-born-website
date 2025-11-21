/**
 * Notifications Settings Component
 *
 * Allows users to manage their notification preferences including:
 * - Email notifications for updates, launches, bonuses
 * - Marketing communications
 * - Newsletter subscription
 * - Launch updates
 *
 * Features:
 * - Form validation using react-hook-form and zod
 * - Toast notifications for success/error states
 * - Loading states during updates
 * - Granular control over notification types
 * - Matches brand design system
 *
 * @module components/settings/NotificationsSettings
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save, Mail, Bell, Gift, Megaphone, BookOpen } from "lucide-react";
import { User } from "next-auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Notifications form validation schema
 */
const notificationsFormSchema = z.object({
  // Launch & Product Updates
  launchUpdates: z.boolean(),
  productAnnouncements: z.boolean(),
  newContent: z.boolean(),

  // Bonus & Rewards
  bonusAvailable: z.boolean(),
  excerptReady: z.boolean(),
  preOrderConfirmation: z.boolean(),

  // Marketing & Communications
  newsletterDigest: z.boolean(),
  marketingEmails: z.boolean(),
  partnerOffers: z.boolean(),

  // Account Activity
  accountUpdates: z.boolean(),
  securityAlerts: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

/**
 * Props for NotificationsSettings component
 */
export interface NotificationsSettingsProps {
  /**
   * User data
   */
  user: User;
  /**
   * Callback when notifications preferences are successfully updated
   */
  onUpdate?: (values: NotificationsFormValues) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * NotificationsSettings Component
 *
 * Displays and allows editing of notification preferences
 */
export function NotificationsSettings({
  user,
  onUpdate,
  className,
}: NotificationsSettingsProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      // Launch & Product Updates
      launchUpdates: true,
      productAnnouncements: true,
      newContent: false,

      // Bonus & Rewards
      bonusAvailable: true,
      excerptReady: true,
      preOrderConfirmation: true,

      // Marketing & Communications
      newsletterDigest: false,
      marketingEmails: false,
      partnerOffers: false,

      // Account Activity
      accountUpdates: true,
      securityAlerts: true,
    },
  });

  /**
   * Handle form submission
   */
  async function onSubmit(data: NotificationsFormValues) {
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/user/notifications", {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to update notification preferences");
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success("Notification preferences updated", {
        description: "Your notification settings have been saved.",
      });

      onUpdate?.(data);
    } catch (error) {
      toast.error("Failed to update notifications", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your notification preferences.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isDirty = form.formState.isDirty;

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Manage your email notification preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Launch & Product Updates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5" />
                Launch & Product Updates
              </CardTitle>
              <CardDescription>
                Stay informed about book launch and new content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="launchUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Launch Updates</FormLabel>
                      <FormDescription>
                        Get notified about official launch date and availability
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productAnnouncements"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Product Announcements</FormLabel>
                      <FormDescription>
                        Major announcements about the book and related products
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newContent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">New Content</FormLabel>
                      <FormDescription>
                        Updates when new excerpts, chapters, or resources are available
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Bonus & Rewards Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="h-5 w-5" />
                Bonus & Rewards
              </CardTitle>
              <CardDescription>
                Notifications about bonuses, excerpts, and pre-order rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bonusAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Bonus Available</FormLabel>
                      <FormDescription>
                        Get notified when your pre-order bonus is ready to download
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerptReady"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Excerpt Ready</FormLabel>
                      <FormDescription>
                        Receive notification when free excerpt is available for download
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preOrderConfirmation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Pre-order Confirmation</FormLabel>
                      <FormDescription>
                        Confirmation emails when your pre-order is verified
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Marketing & Communications Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-5 w-5" />
                Marketing & Communications
              </CardTitle>
              <CardDescription>
                Promotional emails and partner offers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="newsletterDigest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Newsletter Digest</FormLabel>
                      <FormDescription>
                        Weekly or monthly digest of updates and news
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Marketing Emails</FormLabel>
                      <FormDescription>
                        Promotional emails about related books and products
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partnerOffers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Partner Offers</FormLabel>
                      <FormDescription>
                        Special offers from our partners and affiliates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Account Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" />
                Account Activity
              </CardTitle>
              <CardDescription>
                Important notifications about your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="accountUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Account Updates</FormLabel>
                      <FormDescription>
                        Important updates about your account and settings
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="securityAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Security Alerts</FormLabel>
                      <FormDescription>
                        Critical security notifications (always recommended)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading || !isDirty}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save />
                  Save notification preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
