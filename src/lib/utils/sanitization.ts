/**
 * Input sanitization utilities to prevent XSS and other injection attacks
 */

/**
 * Sanitize text content to prevent XSS
 * Removes HTML tags and dangerous characters
 */
export function sanitizeText(input: string): string {
  if (!input) return "";

  return (
    input
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove script-like patterns
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Sanitize email to prevent injection
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";

  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, "");
}

/**
 * Escape HTML special characters for safe display
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

/**
 * Validate and sanitize a URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Check if content contains suspicious patterns
 */
export function containsSuspiciousContent(content: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /<embed/i,
    /<object/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(content));
}
