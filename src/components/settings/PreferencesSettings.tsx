/**
 * Preferences Settings Component
 *
 * Allows users to manage their preferences including:
 * - Newsletter subscription
 * - Email preferences
 * - Theme selection (light/dark/system)
 *
 * Features:
 * - Form validation using react-hook-form and zod
 * - Toast notifications for success/error states
 * - Loading states during updates
 * - Matches brand design system
 *
 * @module components/settings/PreferencesSettings
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save, Moon, Sun, Monitor } from "lucide-react";
import { User } from "next-auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Import user preferences types
 */
import type { UserPreferences, PreferencesResponse } from "@/types/user";

/**
 * Preferences form validation schema
 */
const preferencesFormSchema = z.object({
  newsletter: z.boolean(),
  marketingEmails: z.boolean(),
  productUpdates: z.boolean(),
  weeklyDigest: z.boolean(),
  bonusNotifications: z.boolean(),
  launchEvents: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "en-GB"]),
  emailFrequency: z.enum(["immediate", "daily", "weekly", "never"]),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

/**
 * Props for PreferencesSettings component
 */
export interface PreferencesSettingsProps {
  /**
   * User data
   */
  user: User;
  /**
   * Callback when preferences are successfully updated
   */
  onUpdate?: (values: PreferencesFormValues) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PreferencesSettings Component
 *
 * Displays and allows editing of user preferences
 */
export function PreferencesSettings({
  user,
  onUpdate,
  className,
}: PreferencesSettingsProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      newsletter: true,
      marketingEmails: false,
      productUpdates: true,
      weeklyDigest: false,
      bonusNotifications: true,
      launchEvents: true,
      theme: "system",
      language: "en-GB",
      emailFrequency: "weekly",
    },
  });

  /**
   * Fetch user preferences on mount
   */
  React.useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch("/api/user/preferences");

        if (!response.ok) {
          throw new Error("Failed to fetch preferences");
        }

        const data: PreferencesResponse = await response.json();

        if (data.success && data.preferences) {
          // Map API preferences to form values
          form.reset({
            newsletter: data.preferences.emailNotifications.newsletter,
            marketingEmails: data.preferences.emailNotifications.marketingEmails,
            productUpdates: data.preferences.emailNotifications.productUpdates,
            weeklyDigest: data.preferences.emailNotifications.weeklyDigest,
            bonusNotifications: data.preferences.emailNotifications.bonusNotifications,
            launchEvents: data.preferences.emailNotifications.launchEvents,
            theme: data.preferences.theme,
            language: data.preferences.language,
            emailFrequency: data.preferences.communication.emailFrequency,
          });
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
        toast.error("Failed to load preferences", {
          description: "Using default preferences. Please try refreshing the page.",
        });
      } finally {
        setIsFetching(false);
      }
    }

    fetchPreferences();
  }, [form]);

  /**
   * Handle form submission
   */
  async function onSubmit(data: PreferencesFormValues) {
    setIsLoading(true);

    try {
      // Map form values to API preferences structure
      const preferencesUpdate: Partial<UserPreferences> = {
        emailNotifications: {
          newsletter: data.newsletter,
          marketingEmails: data.marketingEmails,
          productUpdates: data.productUpdates,
          weeklyDigest: data.weeklyDigest,
          bonusNotifications: data.bonusNotifications,
          launchEvents: data.launchEvents,
        },
        theme: data.theme,
        language: data.language,
        communication: {
          preferredChannel: "email",
          emailFrequency: data.emailFrequency,
          mediaContact: false,
          bulkOrderContact: false,
        },
      };

      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferencesUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update preferences");
      }

      const result: PreferencesResponse = await response.json();

      toast.success("Preferences updated", {
        description: "Your preferences have been saved successfully.",
      });

      onUpdate?.(data);
    } catch (error) {
      toast.error("Failed to update preferences", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your preferences.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isDirty = form.formState.isDirty;

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold">Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize your experience and email preferences.
        </p>
      </div>

      {isFetching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Newsletter Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Newsletter Subscription</CardTitle>
                <CardDescription>
                  Manage your email subscription preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="newsletter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Newsletter</FormLabel>
                        <FormDescription>
                          Receive launch updates and the free excerpt
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
                  name="productUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Product Updates</FormLabel>
                        <FormDescription>
                          Get notified about book launch, bonuses, and new content
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
                          Receive promotional emails and special offers
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
                  name="weeklyDigest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Weekly Digest</FormLabel>
                        <FormDescription>
                          Get a weekly summary of updates and news
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
                  name="bonusNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Bonus Notifications</FormLabel>
                        <FormDescription>
                          Get notified when bonus packs and exclusive content are available
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
                  name="launchEvents"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Launch Events</FormLabel>
                        <FormDescription>
                          Receive invitations to book launch events and author talks
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

            {/* Display Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Display Preferences</CardTitle>
                <CardDescription>
                  Customize how the site looks and behaves
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              <span>Light</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              <span>Dark</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              <span>System</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how the site appears to you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en-GB">British English</SelectItem>
                          <SelectItem value="en">American English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select your preferred language
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily">Daily digest</SelectItem>
                          <SelectItem value="weekly">Weekly digest</SelectItem>
                          <SelectItem value="never">Never (only critical)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often would you like to receive email notifications
                      </FormDescription>
                      <FormMessage />
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
                    Save preferences
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
