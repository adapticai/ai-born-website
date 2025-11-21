/**
 * Profile Settings Component
 *
 * Allows users to manage their profile information including:
 * - Name
 * - Email
 * - Avatar image
 *
 * Features:
 * - Form validation using react-hook-form and zod
 * - Toast notifications for success/error states
 * - Loading states during updates
 * - Avatar upload placeholder
 * - Matches brand design system
 *
 * @module components/settings/ProfileSettings
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, User as UserIcon } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { AvatarUpload } from "@/components/auth/AvatarUpload";
import { cn } from "@/lib/utils";

/**
 * Profile form validation schema
 */
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must not exceed 50 characters.",
    })
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .min(1, {
      message: "Email is required.",
    }),
  image: z.string().url().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * Props for ProfileSettings component
 */
export interface ProfileSettingsProps {
  /**
   * User's current profile data
   */
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  /**
   * Callback when profile is successfully updated
   */
  onUpdate?: (values: ProfileFormValues) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ProfileSettings Component
 *
 * Displays and allows editing of user profile information
 */
export function ProfileSettings({
  user,
  onUpdate,
  className,
}: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentAvatar, setCurrentAvatar] = React.useState<string | null>(
    user.image || null
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email,
      image: user.image || "",
    },
  });

  /**
   * Handle form submission
   */
  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/user/profile", {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to update profile");
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profile updated successfully", {
        description: "Your changes have been saved.",
      });

      onUpdate?.(data);
    } catch (error) {
      toast.error("Failed to update profile", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your profile.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle avatar upload success
   */
  const handleAvatarUploadSuccess = (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl);
    form.setValue("image", avatarUrl, { shouldDirty: true });
  };

  /**
   * Handle avatar removal success
   */
  const handleAvatarRemoveSuccess = () => {
    setCurrentAvatar(null);
    form.setValue("image", "", { shouldDirty: true });
  };

  const isDirty = form.formState.isDirty;

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold">Profile Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your personal information and profile picture.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload Section */}
          <AvatarUpload
            currentAvatar={currentAvatar}
            userDisplayName={user.name || user.email}
            onUploadSuccess={handleAvatarUploadSuccess}
            onRemoveSuccess={handleAvatarRemoveSuccess}
          />

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed on your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Your email address is used for sign-in and notifications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  <UserIcon />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
