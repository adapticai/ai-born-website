import Image from "next/image";

interface PullQuoteProps {
  children: React.ReactNode;
  author?: string;
  role?: string;
  company?: string;
  logo?: string;
  variant?: "default" | "large" | "centered";
}

/**
 * PullQuote - Styled blockquote component for MDX blog posts
 *
 * @example
 * ```mdx
 * <PullQuote
 *   author="John Doe"
 *   role="CEO"
 *   company="Nvidia"
 *   logo="/logos/nvidia.svg"
 * >
 *   This is a compelling quote that highlights a key insight from the article.
 * </PullQuote>
 * ```
 */
export function PullQuote({
  children,
  author,
  role,
  company,
  logo,
  variant = "default",
}: PullQuoteProps) {
  if (variant === "large") {
    return (
      <section className="not-prose my-16 md:my-24">
        <div className="mx-auto max-w-2xl">
          <blockquote>
            <p className="font-outfit text-lg font-semibold leading-relaxed text-slate-900 dark:text-slate-50 sm:text-xl md:text-3xl">
              {children}
            </p>

            {(author || logo) && (
              <div className="mt-12 flex items-center gap-6">
                {logo && (
                  <img
                    className="h-7 w-fit dark:invert"
                    src={logo}
                    alt={`${company || author} Logo`}
                    height="28"
                    width="auto"
                  />
                )}
                {(author || role) && (
                  <div className="space-y-1 border-l border-slate-300 pl-6 dark:border-slate-700">
                    {author && (
                      <cite className="block font-outfit font-medium not-italic text-slate-900 dark:text-slate-50">
                        {author}
                      </cite>
                    )}
                    {(role || company) && (
                      <span className="block font-inter text-sm text-slate-600 dark:text-slate-400">
                        {role}
                        {role && company && ", "}
                        {company}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </blockquote>
        </div>
      </section>
    );
  }

  if (variant === "centered") {
    return (
      <section className="not-prose my-16 md:my-24">
        <div className="mx-auto max-w-3xl text-center">
          <blockquote>
            <p className="font-outfit text-2xl font-semibold leading-relaxed text-slate-900 dark:text-slate-50 sm:text-3xl md:text-4xl">
              "{children}"
            </p>

            {(author || logo) && (
              <div className="mt-12 flex flex-col items-center gap-6">
                {logo && (
                  <img
                    className="h-6 w-fit dark:invert"
                    src={logo}
                    alt={`${company || author} Logo`}
                    height="24"
                    width="auto"
                  />
                )}
                {(author || role) && (
                  <div className="space-y-1">
                    {author && (
                      <cite className="block font-outfit font-medium not-italic text-slate-900 dark:text-slate-50">
                        {author}
                      </cite>
                    )}
                    {(role || company) && (
                      <span className="block font-inter text-sm text-slate-600 dark:text-slate-400">
                        {role}
                        {role && company && " at "}
                        {company}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </blockquote>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className="not-prose my-12 border-l-4 border-slate-900 bg-slate-50 py-8 pl-8 pr-6 dark:border-slate-50 dark:bg-slate-900 md:my-16">
      <blockquote>
        <p className="font-inter text-lg leading-relaxed text-slate-700 dark:text-slate-300 sm:text-xl">
          {children}
        </p>

        {(author || role || company) && (
          <footer className="mt-6 flex items-center gap-4">
            {logo && (
              <img
                className="h-5 w-fit dark:invert"
                src={logo}
                alt={`${company || author} Logo`}
                height="20"
                width="auto"
              />
            )}
            <div className="flex items-center gap-2 text-sm">
              {author && (
                <cite className="font-outfit font-medium not-italic text-slate-900 dark:text-slate-50">
                  {author}
                </cite>
              )}
              {(role || company) && (
                <>
                  {author && (
                    <span className="text-slate-400 dark:text-slate-600">
                      ·
                    </span>
                  )}
                  <span className="font-inter text-slate-600 dark:text-slate-400">
                    {role}
                    {role && company && ", "}
                    {company}
                  </span>
                </>
              )}
            </div>
          </footer>
        )}
      </blockquote>
    </section>
  );
}
