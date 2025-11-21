"use client";

import Image from "next/image";
import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

// Hero variant types
export type BlogHeroVariant = "split" | "full-width" | "centered-features";

// Base hero props
interface BaseHeroProps {
  variant: BlogHeroVariant;
}

// Split variant (image + text + quote)
interface SplitHeroProps extends BaseHeroProps {
  variant: "split";
  title: string;
  description: string[];
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  quote?: {
    text: string;
    author: string;
    role?: string;
    logo?: string;
  };
}

// Full-width variant (large image with title/description below)
interface FullWidthHeroProps extends BaseHeroProps {
  variant: "full-width";
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  cta?: {
    text: string;
    href: string;
  };
}

// Centered features variant (centered text, image, then feature grid)
interface CenteredFeaturesHeroProps extends BaseHeroProps {
  variant: "centered-features";
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export type BlogHeroProps =
  | SplitHeroProps
  | FullWidthHeroProps
  | CenteredFeaturesHeroProps;

// Icon mapping for features
const iconMap: Record<string, React.ReactNode> = {
  brain: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
  layers: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  ),
  users: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  shield: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  zap: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  sparkles: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
};

export function BlogHero(props: BlogHeroProps) {
  if (props.variant === "split") {
    return <SplitHero {...props} />;
  }

  if (props.variant === "full-width") {
    return <FullWidthHero {...props} />;
  }

  if (props.variant === "centered-features") {
    return <CenteredFeaturesHero {...props} />;
  }

  return null;
}

function SplitHero({
  title,
  description,
  image,
  quote,
}: Omit<SplitHeroProps, "variant">) {
  return (
    <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-black md:py-24">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <h2 className="relative z-10 max-w-xl font-outfit text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 lg:text-5xl">
          {title}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          {/* Image */}
          <div className="relative mb-6 sm:mb-0">
            <div className="aspect-[76/59] relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-100 to-transparent p-px dark:border-slate-800 dark:from-slate-800">
              <Image
                src={image.src}
                className="h-full w-full rounded-2xl object-cover"
                alt={image.alt}
                width={image.width}
                height={image.height}
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="relative space-y-4">
            {description.map((paragraph, index) => (
              <p
                key={index}
                className="font-inter text-slate-600 dark:text-slate-400"
              >
                {paragraph}
              </p>
            ))}

            {quote && (
              <div className="pt-6">
                <blockquote className="border-l-4 border-slate-900 pl-4 dark:border-slate-50">
                  <p className="font-inter italic text-slate-700 dark:text-slate-300">
                    {quote.text}
                  </p>

                  <div className="mt-6 space-y-3">
                    <cite className="block font-outfit font-medium not-italic text-slate-900 dark:text-slate-50">
                      {quote.author}
                      {quote.role && (
                        <span className="block text-sm font-normal text-slate-600 dark:text-slate-400">
                          {quote.role}
                        </span>
                      )}
                    </cite>
                    {quote.logo && (
                      <img
                        className="h-5 w-fit dark:invert"
                        src={quote.logo}
                        alt="Company Logo"
                        height="20"
                        width="auto"
                      />
                    )}
                  </div>
                </blockquote>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FullWidthHero({
  title,
  description,
  image,
  cta,
}: Omit<FullWidthHeroProps, "variant">) {
  return (
    <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-black md:py-24">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl">
          <Image
            className="h-auto w-full grayscale"
            src={image.src}
            alt={image.alt}
            width={1920}
            height={1080}
            priority
          />
        </div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <h2 className="font-outfit text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          <div className="space-y-6">
            <p className="font-inter text-slate-600 dark:text-slate-400">
              {description}
            </p>

            {cta && (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="gap-1 pr-1.5"
              >
                <Link href={cta.href}>
                  <span>{cta.text}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CenteredFeaturesHero({
  title,
  description,
  image,
  features,
}: Omit<CenteredFeaturesHeroProps, "variant">) {
  return (
    <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-black md:py-24">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        {/* Centered header */}
        <div className="mx-auto max-w-xl space-y-6 text-center md:space-y-8">
          <h2 className="text-balance font-outfit text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 lg:text-5xl">
            {title}
          </h2>
          <p className="font-inter text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        {/* Image */}
        <div className="overflow-hidden rounded-2xl">
          <Image
            className="h-auto w-full grayscale"
            src={image.src}
            alt={image.alt}
            width={1920}
            height={1080}
            priority
          />
        </div>

        {/* Features grid */}
        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2">
                {iconMap[feature.icon] || iconMap.sparkles}
                <h3 className="font-outfit text-sm font-medium text-slate-900 dark:text-slate-50">
                  {feature.title}
                </h3>
              </div>
              <p className="font-inter text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
