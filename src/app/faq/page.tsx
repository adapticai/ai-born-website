import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookFAQ } from "@/components/sections/BookFAQ";
import { BookFooter } from "@/components/sections/BookFooter";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.faq;

export default function FAQPage() {
  return (
    <>
      <BookNavbarWrapper />
      <main className="min-h-screen bg-white pt-16 dark:bg-black">
        <BookFAQ />
      </main>
      <BookFooter />
    </>
  );
}
