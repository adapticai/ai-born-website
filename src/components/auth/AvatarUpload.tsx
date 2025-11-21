/**
 * AvatarUpload Component
 *
 * Full-featured avatar upload with:
 * - Drag-and-drop support
 * - Image preview
 * - Canvas-based cropping/resizing
 * - Upload progress indicator
 * - Validation (max 5MB, jpg/png only)
 * - Remove avatar functionality
 *
 * @module components/auth/AvatarUpload
 */

"use client";

import * as React from "react";
import { Upload, X, Loader2, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/**
 * AvatarUpload Props
 */
export interface AvatarUploadProps {
  /** Current avatar URL */
  currentAvatar?: string | null;
  /** User's name or email for fallback initials */
  userDisplayName: string;
  /** Callback when avatar is successfully uploaded */
  onUploadSuccess?: (avatarUrl: string) => void;
  /** Callback when avatar is successfully removed */
  onRemoveSuccess?: () => void;
  /** Optional className */
  className?: string;
}

/**
 * Resize and crop image to square 200x200 using canvas
 */
async function resizeAndCropImage(
  file: File,
  targetSize: number = 200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Calculate dimensions for center crop
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        // Set canvas size to target
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Draw cropped and resized image
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          targetSize,
          targetSize
        );

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob from canvas"));
            }
          },
          "image/jpeg",
          0.9 // Quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Get user initials for avatar fallback
 */
function getUserInitials(displayName: string): string {
  const parts = displayName.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return displayName.substring(0, 2).toUpperCase();
}

/**
 * AvatarUpload Component
 */
export function AvatarUpload({
  currentAvatar,
  userDisplayName,
  onUploadSuccess,
  onRemoveSuccess,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentAvatar || null
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragCounter = React.useRef(0);

  // Update preview when currentAvatar changes
  React.useEffect(() => {
    setPreviewUrl(currentAvatar || null);
  }, [currentAvatar]);

  /**
   * Validate file
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return "Only JPG and PNG images are allowed.";
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size must be less than 5MB.";
    }

    return null;
  };

  /**
   * Upload avatar to API
   */
  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Resize and crop image
      setUploadProgress(30);
      const resizedBlob = await resizeAndCropImage(file);

      // Create form data
      const formData = new FormData();
      formData.append("avatar", resizedBlob, "avatar.jpg");

      setUploadProgress(50);

      // Upload to API
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload avatar");
      }

      const data = await response.json();
      setUploadProgress(100);

      // Update preview
      setPreviewUrl(data.avatarUrl);

      toast.success("Avatar uploaded successfully", {
        description: "Your profile picture has been updated.",
      });

      onUploadSuccess?.(data.avatarUrl);
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Upload failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload avatar. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error("Invalid file", {
        description: validationError,
      });
      return;
    }

    await uploadAvatar(file);
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Remove avatar
   */
  const handleRemoveAvatar = async () => {
    setIsRemoving(true);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove avatar");
      }

      setPreviewUrl(null);
      setShowRemoveDialog(false);

      toast.success("Avatar removed", {
        description: "Your profile picture has been removed.",
      });

      onRemoveSuccess?.();
    } catch (error) {
      console.error("Avatar removal error:", error);
      toast.error("Removal failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove avatar. Please try again.",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  /**
   * Trigger file input
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Avatar Preview */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <Avatar className="size-24 border-2 border-border transition-all hover:border-brand-cyan">
            <AvatarImage src={previewUrl || undefined} alt={userDisplayName} />
            <AvatarFallback className="bg-gradient-to-br from-brand-cyan/20 to-brand-ember/20 text-xl font-semibold text-brand-porcelain">
              {getUserInitials(userDisplayName)}
            </AvatarFallback>
          </Avatar>

          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-obsidian/80">
              <div className="text-center">
                <Loader2 className="size-6 animate-spin text-brand-cyan" />
                <span className="mt-1 text-xs text-brand-porcelain">
                  {uploadProgress}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          {/* Upload Button */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={isUploading || isRemoving}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="size-4" />
                  Upload avatar
                </>
              )}
            </Button>

            {/* Remove Button */}
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRemoveDialog(true)}
                disabled={isUploading || isRemoving}
                className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            )}
          </div>

          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Upload avatar image"
          />

          {/* Instructions */}
          <p className="text-xs text-muted-foreground">
            JPG or PNG. Max size 5MB. Image will be cropped to square.
          </p>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition-all",
          isDragging
            ? "border-brand-cyan bg-brand-cyan/5"
            : "border-border bg-muted/50 hover:border-brand-cyan/50 hover:bg-muted",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <Upload
          className={cn(
            "mx-auto size-8 transition-colors",
            isDragging ? "text-brand-cyan" : "text-muted-foreground"
          )}
        />
        <p className="mt-2 text-sm font-medium text-foreground">
          Drop your image here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click "Upload avatar" button above
        </p>
      </div>

      {/* Remove Avatar Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove avatar?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your profile picture and replace it with your
              initials. You can upload a new avatar at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAvatar}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove avatar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
