import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
  metadataBase: new URL('https://youthbharat.com'), // CHANGE TO YOUR DOMAIN
  title: {
    default: "YouthBharat - B2B Marketplace & Local Services Search",
    template: "%s | YouthBharat"
  },
  description: "Search for Wholesale Manufacturers, Suppliers, and Local Services in India. Find Doctors, Transporters, Repair Services, and B2B Products in one place.",
  keywords: ["B2B Marketplace", "Wholesalers", "Manufacturers", "Local Services", "Doctors near me", "Business Directory India", "Suppliers"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://youthbharat.com",
    siteName: "YouthBharat",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YouthBharat Marketplace",
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
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
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