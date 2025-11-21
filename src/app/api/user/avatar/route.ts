/**
 * Avatar Upload API Routes
 *
 * Handles user avatar upload and deletion
 * - POST: Upload new avatar (resize to 200x200, upload to R2/S3)
 * - DELETE: Remove avatar
 *
 * @module api/user/avatar
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import sharp from "sharp";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { uploadToStorage } from "@/lib/upload";
import { logger } from "@/lib/logger";

/**
 * Maximum avatar file size (5MB)
 */
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

/**
 * Avatar target dimensions
 */
const AVATAR_SIZE = 200;

/**
 * Allowed image MIME types
 */
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

/**
 * POST: Upload avatar
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPG and PNG are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resize and optimize image using sharp
    const resizedBuffer = await sharp(buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: "cover", // Crop to square
        position: "center",
      })
      .jpeg({
        quality: 90,
        mozjpeg: true, // Use mozjpeg for better compression
      })
      .toBuffer();

    // Generate secure filename
    const timestamp = Date.now();
    const hash = crypto
      .createHash("sha256")
      .update(`${user.id}-${timestamp}`)
      .digest("hex")
      .substring(0, 16);
    const filename = `avatar-${user.id}-${timestamp}-${hash}.jpg`;

    // Upload to storage (R2/S3)
    const avatarUrl = await uploadToStorage(resizedBuffer, filename, {
      folder: "avatars",
      contentType: "image/jpeg",
      maxAge: 31536000, // 1 year cache
      metadata: {
        userId: user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update user record in database
    const currentPreferences = (user.preferences as Record<string, unknown>) || {};
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: {
          ...currentPreferences,
          avatarUrl,
        } as any,
      },
    });

    // Log upload
    if (logger && typeof logger.info === 'function') {
      logger.info({
        userId: user.id,
        filename,
        size: resizedBuffer.length,
      }, "Avatar uploaded");
    }

    return NextResponse.json(
      {
        success: true,
        avatarUrl,
        message: "Avatar uploaded successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ err: error }, "Avatar upload failed");

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Storage configuration")) {
        return NextResponse.json(
          { message: "Storage not configured. Please contact support." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { message: "Failed to upload avatar. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove avatar
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove avatar URL from preferences
    const preferences = (user.preferences as Record<string, unknown>) || {};
    if ("avatarUrl" in preferences) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { avatarUrl, ...rest } = preferences;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          preferences: rest as any,
        },
      });
    }

    // Note: We're not deleting the file from storage to prevent broken links
    // in case the URL is cached or referenced elsewhere.
    // Consider implementing a cleanup job to remove old avatars.

    // Log removal
    if (logger && typeof logger.info === 'function') {
      logger.info({
        userId: user.id,
      }, "Avatar removed");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Avatar removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ err: error }, "Avatar removal failed");

    return NextResponse.json(
      { message: "Failed to remove avatar. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET: Get current avatar URL (optional, for verification)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get avatar URL from preferences
    const preferences = (user.preferences as Record<string, unknown>) || {};
    const avatarUrl = (preferences.avatarUrl as string) || null;

    return NextResponse.json(
      {
        success: true,
        avatarUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error({ err: error }, "Failed to get avatar");
    }

    return NextResponse.json(
      { message: "Failed to retrieve avatar" },
      { status: 500 }
    );
  }
}
