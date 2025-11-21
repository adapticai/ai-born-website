import { PullQuote } from "./PullQuote";

/**
 * Custom MDX components available in all blog posts
 * These can be used directly in .mdx files without imports
 */
export const mdxComponents = {
  PullQuote,
};

export type MDXComponents = typeof mdxComponents;
