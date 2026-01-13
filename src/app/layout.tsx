import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";

// Handwritten font for sticky notes
const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Clean UI font
const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GDG Community Wall",
  description: "Share your thoughts on the community wall!",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${caveat.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
