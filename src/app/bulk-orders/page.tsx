import { BookNavbarWrapper } from "@/components/BookNavbarWrapper";
import { BookBulkOrdersWithAuth } from "@/components/sections/BookBulkOrders";
import { BookFooter } from "@/components/sections/BookFooter";
import { pageMetadata } from "@/lib/metadata";
import { getCurrentUser } from "@/lib/auth";

export const metadata = pageMetadata.bulkOrders;

export default async function BulkOrdersPage() {
  const user = await getCurrentUser();

  return (
    <>
      <BookNavbarWrapper />
      <main className="min-h-screen bg-white pt-16 dark:bg-black">
        <BookBulkOrdersWithAuth user={user} />
      </main>
      <BookFooter />
    </>
  );
}
