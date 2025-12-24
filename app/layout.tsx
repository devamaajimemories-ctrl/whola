import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google"; // 🔴 CAUSING CRASH: Commented out temporarily
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import SeoFooter from "@/components/SeoFooter";

// 🔴 FIX: Replace Google Font with a simple system font class
// const inter = Inter({ subsets: ["latin"] }); 
const inter = { className: "font-sans" }; 

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://youthbharatwholesalemart.com'),
  title: {
    default: "YouthBharat WholesaleMart - B2B Marketplace & Local Services",
    template: "%s | YouthBharat WholesaleMart"
  },
  description: "Search for Wholesale Manufacturers, Suppliers, and Local Services in India.",
  keywords: ["B2B Marketplace", "Wholesalers", "Manufacturers", "Local Services"],
  openGraph: {
    type: "website",
    locale: "en_IN",
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
        {/* AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1998616030682500"
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