import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // Import Script for AdSense
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import SeoFooter from "@/components/SeoFooter";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  // 1. DOMAIN CHANGE: Base URL for all metadata
  metadataBase: new URL('https://youthbharatwholesalemart.com'), 
  
  title: {
    default: "YouthBharat WholesaleMart - B2B Marketplace & Local Services",
    template: "%s | YouthBharat WholesaleMart"
  },
  description: "Search for Wholesale Manufacturers, Suppliers, and Local Services in India. Find Doctors, Transporters, Repair Services, and B2B Products in one place.",
  keywords: ["B2B Marketplace", "Wholesalers", "Manufacturers", "Local Services", "Doctors near me", "Business Directory India", "Suppliers"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    // 2. DOMAIN CHANGE: OG URL
    url: "https://youthbharatwholesalemart.com", 
    siteName: "YouthBharat WholesaleMart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YouthBharat WholesaleMart Marketplace",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // 3. REMINDER: You will get a NEW code from Google Search Console for the new domain
    google: "YOUR_NEW_GOOGLE_VERIFICATION_CODE", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* 4. ADSENSE INTEGRATION: Replace client=ca-pub-XXX with your real ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
          <SeoFooter />
        </Providers>
      </body>
    </html>
  );
}