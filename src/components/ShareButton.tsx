"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  excerpt: string;
}

export function ShareButton({ title, excerpt }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof navigator === "undefined") return;

    if (navigator.share) {
      navigator.share({
        title,
        text: excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Optionally show a toast notification here
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <Share2 className="h-4 w-4" />
      <span>Share</span>
    </button>
  );
}
