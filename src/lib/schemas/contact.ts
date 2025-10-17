import * as z from "zod";

// Email validation with basic format checking
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .refine((email) => {
    // Basic domain validation (ensure there's a domain after @)
    const parts = email.split("@");
    if (parts.length !== 2) return false;
    const domain = parts[1];
    return domain.includes(".") && domain.length > 3;
  }, "Invalid email domain");

// Media request schema
export const mediaRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  outlet: z.string().min(2, "Outlet/Organization is required"),
  requestType: z.enum([
    "review_copy",
    "interview",
    "speaking_engagement",
    "bulk_order",
    "other",
  ]),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must not exceed 2000 characters"),
  honeypot: z.string().optional(), // Anti-spam honeypot field
});

export type MediaRequestInput = z.infer<typeof mediaRequestSchema>;

// Bulk order schema
export const bulkOrderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  company: z.string().min(2, "Company name is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(10, "Minimum bulk order is 10 copies")
    .max(100000, "Please contact us directly for orders over 100,000 copies"),
  message: z
    .string()
    .min(10, "Please provide details about your order")
    .max(2000, "Message must not exceed 2000 characters"),
  honeypot: z.string().optional(), // Anti-spam honeypot field
});

export type BulkOrderInput = z.infer<typeof bulkOrderSchema>;

// Email capture schema (for newsletter/excerpt)
export const emailCaptureSchema = z.object({
  name: z.string().optional(),
  email: emailSchema,
  source: z.string().optional(),
  honeypot: z.string().optional(),
});

export type EmailCaptureInput = z.infer<typeof emailCaptureSchema>;

// Bonus claim schema
export const bonusClaimSchema = z.object({
  email: emailSchema,
  orderId: z.string().min(3, "Order ID is required"),
  honeypot: z.string().optional(),
});

export type BonusClaimInput = z.infer<typeof bonusClaimSchema>;
