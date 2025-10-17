import { BookNavbar } from "@/components/BookNavbar";
import { BookFooter } from "@/components/sections/BookFooter";
import { BookFAQ } from "@/components/sections/BookFAQ";

export const metadata = {
  title: "FAQ — AI-Born",
  description: "Frequently asked questions about AI-Born by Mehran Granfar.",
};

export default function FAQPage() {
  return (
    <>
      <BookNavbar />
      <main className="min-h-screen bg-white pt-16 dark:bg-black">
        <BookFAQ />
      </main>
      <BookFooter />
    </>
  );
}
