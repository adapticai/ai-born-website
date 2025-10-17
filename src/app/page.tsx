import { BookNavbar } from "@/components/BookNavbar";
import { BookAsSeenIn } from "@/components/sections/BookAsSeenIn";
import { BookAudiences } from "@/components/sections/BookAudiences";
import { BookDifference } from "@/components/sections/BookDifference";
import { BookEndorsements } from "@/components/sections/BookEndorsements";
import { BookExcerpt } from "@/components/sections/BookExcerpt";
import { BookFooter } from "@/components/sections/BookFooter";
import { BookFrameworks } from "@/components/sections/BookFrameworks";
import { BookHero } from "@/components/sections/BookHero";
import { BookOverview } from "@/components/sections/BookOverview";
import { BookProblem } from "@/components/sections/BookProblem";
import { BookSolution } from "@/components/sections/BookSolution";
import { BookStakes } from "@/components/sections/BookStakes";

export default function Home() {
  return (
    <>
      <BookNavbar />
      <main className="min-h-screen bg-white dark:bg-black">
        {/* Hero & Core Value Proposition */}
        <BookHero />

        {/* Social Proof - As Seen In */}
        <BookAsSeenIn />

        {/* The Problem (3 crises) */}
        <BookProblem />

        {/* The Solution (4 pillars) */}
        <BookSolution />

        {/* What Makes Different (comparison) */}
        <BookDifference />

        {/* Who This Is For (audiences) */}
        <BookAudiences />

        {/* The Stakes (pull quote + stats) */}
        <BookStakes />

        {/* Book Overview & Frameworks */}
        <BookOverview />
        <BookFrameworks />

        {/* Social Proof */}
        <BookEndorsements />

        {/* Lead Capture */}
        <BookExcerpt />

        <BookFooter />
      </main>
    </>
  );
}
