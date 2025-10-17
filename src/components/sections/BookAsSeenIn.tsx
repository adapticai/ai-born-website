"use client";

import Image from "next/image";
import Marquee from "react-fast-marquee";
import { cn } from "@/lib/utils";

type Publication = {
  name: string;
  logo: string;
  width: number;
  height: number;
};

export const BookAsSeenIn = () => {
  const publications: Publication[] = [
    {
      name: "The Wall Street Journal",
      logo: "/logos/publications/wsj.svg",
      width: 200,
      height: 40,
    },
    {
      name: "The New York Times",
      logo: "/logos/publications/nyt.svg",
      width: 200,
      height: 40,
    },
    {
      name: "Bloomberg",
      logo: "/logos/publications/bloomberg.svg",
      width: 200,
      height: 40,
    },
    {
      name: "The Atlantic",
      logo: "/logos/publications/atlantic.svg",
      width: 180,
      height: 28,
    },
    {
      name: "CNN",
      logo: "/logos/publications/cnn.svg",
      width: 110,
      height: 28,
    },
    {
      name: "The New Yorker",
      logo: "/logos/publications/new-yorker.svg",
      width: 180,
      height: 28,
    },
    {
      name: "Sydney Morning Herald",
      logo: "/logos/publications/smh.svg",
      width: 180,
      height: 40,
    },
  ];

  return (
    <section className="border-b border-neutral-200 bg-neutral-50 py-6 dark:border-neutral-800 dark:bg-neutral-950 lg:py-8">
      <div className="container space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            As Seen In
          </p>
        </div>

        <div className="flex w-full items-center">
          {/* Desktop static version */}
          <div className="hidden w-full md:block">
            <div className="grid grid-cols-4 items-center justify-items-center gap-x-12 gap-y-8 lg:grid-cols-7 lg:gap-x-16">
              {publications.map((publication, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center opacity-60 transition-opacity hover:opacity-100"
                >
                  <Image
                    src={publication.logo}
                    alt={`${publication.name} logo`}
                    width={publication.width}
                    height={publication.height}
                    className={cn(
                      "h-auto w-auto object-contain",
                      publication.name === "The Wall Street Journal" ||
                      publication.name === "The New York Times" ||
                      publication.name === "Sydney Morning Herald"
                        ? "max-h-10"
                        : "max-h-7",
                      publication.name === "CNN" || publication.name === "Bloomberg"
                        ? "dark:brightness-0 dark:invert"
                        : "dark:invert"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile marquee version */}
          <div className="w-full md:hidden">
            <Marquee pauseOnHover gradient={false} speed={30}>
              {publications.map((publication, index) => (
                <div
                  key={index}
                  className="mx-8 inline-flex items-center justify-center opacity-60"
                >
                  <Image
                    src={publication.logo}
                    alt={`${publication.name} logo`}
                    width={publication.width}
                    height={publication.height}
                    className={cn(
                      "h-auto w-auto object-contain",
                      publication.name === "The Wall Street Journal" ||
                      publication.name === "The New York Times" ||
                      publication.name === "Sydney Morning Herald"
                        ? "max-h-10"
                        : "max-h-7",
                      publication.name === "CNN" || publication.name === "Bloomberg"
                        ? "dark:brightness-0 dark:invert"
                        : "dark:invert"
                    )}
                  />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
};
