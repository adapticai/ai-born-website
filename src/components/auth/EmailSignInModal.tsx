/**
 * Email Sign In Modal Component
 *
 * Beautiful modal for email magic link authentication
 * - Email validation using Zod
 * - Success and error states
 * - Loading state during submission
 * - Accessible keyboard navigation
 * - Brand-aligned design system
 *
 * @module components/auth/EmailSignInModal
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Validation schema
const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

// Modal state types
type ModalState = "input" | "loading" | "success" | "error";

export interface EmailSignInModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when modal open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * URL to redirect to after sign-in
   */
  callbackUrl?: string;
}

/**
 * Email Sign In Modal
 * Handles magic link authentication flow with beautiful UI
 */
export function EmailSignInModal({
  open,
  onOpenChange,
  callbackUrl = "/",
}: EmailSignInModalProps) {
  const [modalState, setModalState] = useState<ModalState>("input");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: EmailFormData) => {
    try {
      setModalState("loading");
      setErrorMessage("");

      const result = await signIn("email", {
        email: data.email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error cases
        if (result.error === "AccessDenied") {
          setErrorMessage(
            "Access denied. Please check your email address and try again."
          );
        } else if (result.error === "Configuration") {
          setErrorMessage(
            "Email service is not configured. Please contact support."
          );
        } else {
          setErrorMessage(
            "Failed to send magic link. Please try again in a moment."
          );
        }
        setModalState("error");
      } else {
        // Success - email sent
        setModalState("success");
      }
    } catch (error) {
      console.error("Email sign-in error:", error);
      setErrorMessage(
        "An unexpected error occurred. Please try again in a moment."
      );
      setModalState("error");
    }
  };

  /**
   * Reset modal state when closing
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset after animation completes
      setTimeout(() => {
        setModalState("input");
        setErrorMessage("");
        form.reset();
      }, 200);
    }
    onOpenChange(newOpen);
  };

  /**
   * Retry after error
   */
  const handleRetry = () => {
    setModalState("input");
    setErrorMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {modalState === "success"
              ? "Check your email"
              : modalState === "error"
                ? "Something went wrong"
                : "Sign in with email"}
          </DialogTitle>
          <DialogDescription>
            {modalState === "success"
              ? "We've sent you a magic link to sign in to your account."
              : modalState === "error"
                ? "We couldn't send your magic link. Please try again."
                : "Enter your email address and we'll send you a magic link to sign in."}
          </DialogDescription>
        </DialogHeader>

        {/* Input State */}
        {modalState === "input" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90 font-medium"
                size="lg"
              >
                <Mail className="mr-2 h-5 w-5" />
                Send magic link
              </Button>
            </form>
          </Form>
        )}

        {/* Loading State */}
        {modalState === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-brand-cyan" />
            <p className="mt-4 text-sm text-muted-foreground">
              Sending magic link...
            </p>
          </div>
        )}

        {/* Success State */}
        {modalState === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-brand-cyan/10 p-3">
              <CheckCircle2 className="h-12 w-12 text-brand-cyan" />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              We sent an email to{" "}
              <span className="font-medium text-foreground">
                {form.getValues("email")}
              </span>
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Click the link in the email to sign in. You can close this window.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}

        {/* Error State */}
        {modalState === "error" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {errorMessage}
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRetry}
                className="bg-brand-cyan text-brand-obsidian hover:bg-brand-cyan/90"
              >
                Try again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
