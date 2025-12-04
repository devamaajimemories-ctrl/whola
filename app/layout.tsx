import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import SeoFooter from "@/components/SeoFooter";

const inter = Inter({ subsets: ["latin"] });

// 1. Add Viewport export for mobile responsiveness scoring
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af", // Matches your blue theme
};

// 2. Enhanced Base Metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://youthbharat.com'), // CHANGE TO YOUR DOMAIN
  title: {
    default: "YouthBharat WholesaleMart - B2B Marketplace India",
    template: "%s | YouthBharat" // This auto-appends brand name to inner pages
  },
  description: "India's fastest growing B2B marketplace. Find verified sellers, manufacturers, and wholesalers for electronics, fashion, industrial machinery, and more.",
  keywords: ["B2B Marketplace", "Wholesale India", "Manufacturers", "Suppliers", "Business to Business"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://youthbharat.com",
    siteName: "YouthBharat",
    images: [
      {
        url: "/og-image.png", // You need to create this image in public folder
        width: 1200,
        height: 630,
        alt: "YouthBharat B2B Marketplace",
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
    google: "YOUR_GOOGLE_VERIFICATION_CODE", // Get this from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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