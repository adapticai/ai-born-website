"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader2, Download, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// Schema & Types
// ============================================================================

const excerptFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  name: z.string().optional(),
  honeypot: z.string().max(0).optional(),
});

type ExcerptFormData = z.infer<typeof excerptFormSchema>;

interface ExcerptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalView = "loading" | "sign-in" | "form" | "success" | "download";

// ============================================================================
// Component
// ============================================================================

export function ExcerptModal({ open, onOpenChange }: ExcerptModalProps) {
  const { data: session, status } = useSession();
  const [view, setView] = useState<ModalView>("loading");
  const [hasEntitlement, setHasEntitlement] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExcerptFormData>({
    resolver: zodResolver(excerptFormSchema),
    defaultValues: {
      email: "",
      name: "",
      honeypot: "",
    },
  });

  // Check authentication and entitlement status when modal opens
  useEffect(() => {
    if (!open) return;

    const checkEntitlement = async () => {
      setView("loading");

      // Wait for session to load
      if (status === "loading") {
        return;
      }

      // If not authenticated, show sign-in prompt
      if (status === "unauthenticated" || !session?.user) {
        setView("sign-in");
        return;
      }

      // Check if user has excerpt entitlement
      try {
        const response = await fetch("/api/excerpt/check-entitlement");
        const data = await response.json();

        setHasEntitlement(data.hasEntitlement);

        if (data.hasEntitlement && data.downloadUrl) {
          // User has entitlement, show download view
          setDownloadUrl(data.downloadUrl);
          setView("download");
        } else {
          // User is authenticated but no entitlement, show claim form
          setView("form");
        }
      } catch (error) {
        console.error("Error checking entitlement:", error);
        // Fallback to form view on error
        setView("form");
      }
    };

    checkEntitlement();
  }, [open, status, session]);

  const onSubmit = async (data: ExcerptFormData) => {
    setSubmitState("submitting");
    setErrorMessage("");

    try {
      // Track analytics event
      trackEvent({
        event: "lead_capture_submit",
        source: "hero-excerpt",
      });

      const response = await fetch("/api/excerpt/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          source: "hero-excerpt",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Track error event
        trackEvent({
          event: "form_error",
          form_id: "excerpt-modal",
          error_type: response.status === 429 ? "rate-limit" : "server",
        });

        throw new Error(result.message || "Submission failed");
      }

      // Track success
      trackEvent({
        event: "lead_capture_submit",
        source: "hero-excerpt",
        success: true,
      });

      setDownloadUrl(result.downloadUrl || "");
      setSubmitState("success");
      setView("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    }
  };

  const handleClose = () => {
    // Don't close during submission
    if (submitState === "submitting") return;

    onOpenChange(false);

    // Reset state after animation completes
    setTimeout(() => {
      reset();
      setSubmitState("idle");
      setErrorMessage("");
      setDownloadUrl("");
      setView("loading");
    }, 300);
  };

  const handleSignIn = () => {
    // Redirect to sign-in page with callback
    const callbackUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `/auth/signin?callbackUrl=${callbackUrl}`;
  };

  // Determine dialog title and description based on view
  const getDialogContent = () => {
    switch (view) {
      case "sign-in":
        return {
          title: "Sign In Required",
          description: "Please sign in to access your free excerpt.",
        };
      case "download":
        return {
          title: "Your Excerpt is Ready",
          description: "Download your free chapter from AI-Born.",
        };
      case "success":
        return {
          title: "Check Your Email",
          description: "Your excerpt is on its way!",
        };
      default:
        return {
          title: "Get Free Excerpt",
          description: "Enter your email to receive a free chapter from AI-Born.",
        };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="bg-white text-black sm:max-w-md dark:bg-black dark:text-white"
        aria-describedby="excerpt-modal-description"
      >
        <DialogHeader>
          <DialogTitle className="font-outfit text-2xl font-bold">
            {dialogContent.title}
          </DialogTitle>
          <DialogDescription id="excerpt-modal-description">
            {dialogContent.description}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {view === "loading" && (
            <LoadingState key="loading" />
          )}
          {view === "sign-in" && (
            <SignInState key="sign-in" onSignIn={handleSignIn} />
          )}
          {view === "download" && (
            <DownloadState
              key="download"
              downloadUrl={downloadUrl}
              onClose={handleClose}
            />
          )}
          {view === "success" && (
            <SuccessState
              key="success"
              downloadUrl={downloadUrl}
              onClose={handleClose}
            />
          )}
          {view === "form" && (
            <FormState
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              register={register}
              errors={errors}
              submitState={submitState}
              errorMessage={errorMessage}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Loading State Component
// ============================================================================

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-center py-8"
    >
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </motion.div>
  );
}

// ============================================================================
// Sign-In State Component
// ============================================================================

interface SignInStateProps {
  onSignIn: () => void;
}

function SignInState({ onSignIn }: SignInStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 py-4"
    >
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <LogIn className="h-8 w-8 text-slate-600 dark:text-slate-400" />
        </div>
        <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
          Sign in to access your free excerpt. If you have already claimed your
          excerpt, you can download it directly.
        </p>
      </div>

      <Button
        onClick={onSignIn}
        className="font-outfit h-12 w-full rounded-none bg-black text-base font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button>

      <p className="font-inter text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account? We&apos;ll create one for you automatically.
      </p>
    </motion.div>
  );
}

// ============================================================================
// Download State Component
// ============================================================================

interface DownloadStateProps {
  downloadUrl: string;
  onClose: () => void;
}

function DownloadState({ downloadUrl, onClose }: DownloadStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 py-4 text-center"
    >
      {/* Check Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
      >
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </motion.div>

      {/* Message */}
      <div className="space-y-2">
        <h3 className="font-outfit text-lg font-semibold">
          You Already Have Access!
        </h3>
        <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
          You&apos;ve already claimed your free excerpt. Download it below.
        </p>
      </div>

      {/* Download Button */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="font-outfit inline-flex items-center gap-2 rounded-none border-2 border-black px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          onClick={() => {
            trackEvent({
              event: "lead_capture_submit",
              source: "hero-excerpt",
              success: true,
            });
          }}
        >
          <Download className="h-4 w-4" />
          Download Excerpt
        </a>
      )}

      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="outline"
        className="font-outfit w-full rounded-none border-2 border-slate-300 text-base font-semibold dark:border-slate-700"
      >
        Close
      </Button>
    </motion.div>
  );
}

// ============================================================================
// Form State Component
// ============================================================================

interface FormStateProps {
  onSubmit: () => void;
  register: ReturnType<typeof useForm<ExcerptFormData>>["register"];
  errors: ReturnType<typeof useForm<ExcerptFormData>>["formState"]["errors"];
  submitState: "idle" | "submitting" | "success" | "error";
  errorMessage: string;
}

function FormState({
  onSubmit,
  register,
  errors,
  submitState,
  errorMessage,
}: FormStateProps) {
  const isSubmitting = submitState === "submitting";

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="font-inter text-sm font-medium">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-required="true"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={isSubmitting}
          className="font-inter"
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-500" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Name Field (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-inter text-sm font-medium">
          Name (Optional)
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          disabled={isSubmitting}
          className="font-inter"
          {...register("name")}
        />
      </div>

      {/* Honeypot Field (Hidden for spam prevention) */}
      <input
        type="text"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-0 top-0 h-0 w-0 opacity-0"
        {...register("honeypot")}
      />

      {/* Error Message */}
      {submitState === "error" && errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="font-outfit h-12 w-full rounded-none bg-black text-base font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-100"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Get Free Excerpt"
        )}
      </Button>

      {/* Privacy Note */}
      <p className="font-inter text-xs text-slate-500 dark:text-slate-400">
        We&apos;ll send you the excerpt and occasional updates. Unsubscribe
        anytime.
      </p>
    </motion.form>
  );
}

// ============================================================================
// Success State Component
// ============================================================================

interface SuccessStateProps {
  downloadUrl: string;
  onClose: () => void;
}

function SuccessState({ downloadUrl, onClose }: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 py-4 text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
      >
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </motion.div>

      {/* Success Message */}
      <div className="space-y-2">
        <h3 className="font-outfit text-lg font-semibold">
          Excerpt Sent Successfully!
        </h3>
        <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
          We&apos;ve sent the free chapter to your email. It should arrive
          within a few minutes.
        </p>
      </div>

      {/* Download Link (if available) */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="font-outfit inline-flex items-center gap-2 rounded-none border-2 border-black px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          onClick={() => {
            trackEvent({
              event: "presskit_download",
              asset_type: "synopsis",
              format: "pdf",
            });
          }}
        >
          <Download className="h-4 w-4" />
          Download Now
        </a>
      )}

      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="outline"
        className="font-outfit w-full rounded-none border-2 border-slate-300 text-base font-semibold dark:border-slate-700"
      >
        Close
      </Button>
    </motion.div>
  );
}
