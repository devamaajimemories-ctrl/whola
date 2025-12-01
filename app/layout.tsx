import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers"; // <--- Import this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouthBharat WholesaleMart",
  description: "Largest Searchable B2B Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap everything inside Providers */}
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}