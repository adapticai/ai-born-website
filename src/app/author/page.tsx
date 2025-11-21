import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookAuthor } from "@/components/sections/BookAuthor";
import { BookFooter } from "@/components/sections/BookFooter";
import { pageMetadata, generateAuthorStructuredData } from "@/lib/metadata";

export const metadata = pageMetadata.author;

export default function AuthorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateAuthorStructuredData()),
        }}
      />
      <BookNavbarWrapper />
      <main className="min-h-screen bg-white pt-16 dark:bg-black">
        <BookAuthor />
      </main>
      <BookFooter />
    </>
  );
}
