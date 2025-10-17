import { Inter, Outfit } from "next/font/google";

import type { Metadata } from "next";

import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";
import { StyleGlideProvider } from "@/components/styleglide-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

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
  title: {
    default: "AI-Born — The Blueprint for AI-Native Organisations | Mehran Granfar",
    template: "%s | AI-Born",
  },
  description:
    "The definitive blueprint for AI-native organisations and manifesto for the human transition ahead. Part field manual, part historical reckoning, part moral call to arms.",
  keywords: [
    "AI-native organisations",
    "AI architecture",
    "autonomous agents",
    "AI governance",
    "enterprise AI",
    "Mehran Granfar",
    "AI-Born book",
    "business AI",
    "AI transformation",
    "AI strategy",
  ],
  authors: [{ name: "Mehran Granfar" }],
  creator: "Mehran Granfar",
  publisher: "Mic Press, Inc.",
  robots: {
    index: true,
    follow: true,
  },
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
  openGraph: {
    title: "AI-Born | Mehran Granfar",
    description:
      "The definitive blueprint for AI-native organisations and manifesto for the human transition ahead.",
    siteName: "AI-Born",
    images: [
      {
        url: "https://ai-born.org/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being",
      },
    ],
    locale: "en_US",
    type: "book",
    url: "https://ai-born.org",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Born | Mehran Granfar",
    description:
      "The definitive blueprint for AI-native organisations and manifesto for the human transition ahead.",
    images: ["https://ai-born.org/twitter-card.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Book",
              "name": "AI-Born: The Machine Core, the Human Cortex, and the Next Economy of Being",
              "author": {
                "@type": "Person",
                "name": "Mehran Granfar",
                "jobTitle": "Founder & CEO",
                "affiliation": {
                  "@type": "Organization",
                  "name": "Adaptic.ai"
                }
              },
              "workExample": [
                {
                  "@type": "Book",
                  "bookFormat": "https://schema.org/Hardcover"
                },
                {
                  "@type": "Book",
                  "bookFormat": "https://schema.org/EBook"
                }
              ],
              "publisher": {
                "@type": "Organization",
                "name": "Mic Press, Inc.",
                "url": "https://micpress.com",
                "legalName": "Mic Press, Inc."
              },
              "inLanguage": "en",
              "genre": ["Business", "Technology", "Economics"],
              "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/PreOrder",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className={`${outfit.variable} ${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StyleGlideProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
