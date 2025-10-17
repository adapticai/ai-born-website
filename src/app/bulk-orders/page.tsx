import { BookNavbar } from "@/components/BookNavbar";
import { BookFooter } from "@/components/sections/BookFooter";
import { BookBulkOrders } from "@/components/sections/BookBulkOrders";

export const metadata = {
  title: "Bulk Orders — AI-Born",
  description: "Corporate and bulk orders for AI-Born by Mehran Granfar. NYT-friendly distributed ordering guidance.",
};

export default function BulkOrdersPage() {
  return (
    <>
      <BookNavbar />
      <main className="min-h-screen bg-white pt-16 dark:bg-black">
        <BookBulkOrders />
      </main>
      <BookFooter />
    </>
  );
}
