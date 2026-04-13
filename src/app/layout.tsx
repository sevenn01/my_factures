import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Script from "next/script";

import Providers from "@/components/Providers";
import Shell from "@/components/layout/Shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Monfactures | Smart Business Management",
    template: "%s | Monfactures",
  },
  description: "A smooth, Notion-inspired ERP and CRM workspace. Manage invoices, clients, and products with total clarity and zero clutter.",
  keywords: ["Invoice", "SaaS", "Business Management", "CRM", "ERP", "Billing", "Notion-like ERP", "Productivity"],
  authors: [{ name: "Monfactures Team" }],
  creator: "Monfactures",
  publisher: "Monfactures",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://invoiceme.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Monfactures | The new standard for business management",
    description: "A minimalist workspace that blends invoicing, client management, and product tracking into one seamless workflow.",
    siteName: "Monfactures",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monfactures | Manage your business with total clarity.",
    description: "Simplified invoicing and client management for modern teams.",
    creator: "@monfactures",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'light' || t === 'dark') {
                  document.documentElement.setAttribute('data-theme', t);
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex text-[var(--foreground)] bg-[var(--background)]">
        <Providers>
          <Shell>
            {children}
          </Shell>
        </Providers>
      </body>
    </html>
  );
}
