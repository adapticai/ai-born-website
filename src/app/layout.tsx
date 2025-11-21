import { Inter, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Footer } from "@/components/blocks/footer";
import { CookieConsent } from "@/components/CookieConsent";
import { GTMConditional } from "@/components/GTMConditional";
import { StyleGlideProvider } from "@/components/styleglide-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { SessionTimeout } from "@/components/auth/SessionTimeout";
import { Toaster } from "@/components/ui/sonner";

import type { Metadata } from "next";
import "@/styles/globals.css";
import { defaultMetadata, siteConfig, generateBookStructuredData } from "@/lib/metadata";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...defaultMetadata,
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get GTM ID from environment variable
  // Set NEXT_PUBLIC_GTM_ID in your .env.local file
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBookStructuredData())
          }}
        />
      </head>
      <body className={`${outfit.variable} ${inter.variable} antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthErrorBoundary>
              <StyleGlideProvider />
              {children}

              {/* Session Timeout Monitoring - shows warnings and handles expiration */}
              <SessionTimeout />

              {/* Toast Notifications - used by SessionTimeout and other components */}
              <Toaster position="top-right" />

              {/* Cookie Consent Banner - displays on first visit */}
              <CookieConsent />

              {/* GTM - only loads after analytics consent given */}
              {gtmId && <GTMConditional gtmId={gtmId} />}

              {/* Vercel Analytics - Web Vitals tracking */}
              <Analytics />

              {/* Vercel Speed Insights - Real User Monitoring */}
              <SpeedInsights />

              {/* Web Vitals Reporter - Custom GTM integration */}
              <WebVitalsReporter />
            </AuthErrorBoundary>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
