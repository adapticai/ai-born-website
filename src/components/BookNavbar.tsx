"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { RetailerMenu } from "@/components/RetailerMenu";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Overview", href: "/" },
  { name: "Frameworks", href: "#frameworks" },
  { name: "For Who", href: "#audiences" },
  { name: "Author", href: "#author" },
  { name: "Media Kit", href: "/media-kit" },
];

export function BookNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-black/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-outfit text-xl font-extrabold tracking-tight text-black dark:text-white">
              AI-BORN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-outfit text-sm font-semibold tracking-tight text-slate-700 transition-colors hover:text-black dark:text-slate-300 dark:hover:text-white"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <RetailerMenu
              triggerText="Pre-order"
              triggerVariant="primary"
              originSection="header"
              className="text-sm px-6 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-outfit font-semibold tracking-tight transition-colors rounded-none"
            />
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-black md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            <div className="pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <RetailerMenu
                triggerText="Pre-order Now"
                triggerVariant="primary"
                originSection="mobile-header"
                className="w-full text-base px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-outfit font-semibold tracking-tight transition-colors rounded-none"
              />
            </div>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-outfit text-base font-semibold tracking-tight text-slate-700 transition-colors hover:text-black dark:text-slate-300 dark:hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
