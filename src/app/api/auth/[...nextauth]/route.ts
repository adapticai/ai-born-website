/**
 * NextAuth v5 API Route Handler
 *
 * This file exports the GET and POST handlers for NextAuth.
 * All authentication requests are handled through this route.
 *
 * @see https://authjs.dev/getting-started/installation
 */

import { handlers } from "../../../../../auth";

/**
 * Export HTTP method handlers
 */
export const { GET, POST } = handlers;
