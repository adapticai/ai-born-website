import { BookNavbar } from "@/components/BookNavbar";
import { BookFooter } from "@/components/sections/BookFooter";
import { BookAuthor } from "@/components/sections/BookAuthor";

export const metadata = {
  title: "About the Author — AI-Born",
  description: "Meet Mehran Granfar, author of AI-Born and Founder & CEO of Adaptic.ai.",
};

export default function AuthorPage() {
  return (
    <>
      <BookNavbar />
      <main className="min-h-screen bg-white pt-16 dark:bg-black">
        <BookAuthor />
      </main>
      <BookFooter />
    </>
  );
}
