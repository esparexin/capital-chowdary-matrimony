import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Cormorant_Garamond,
  Noto_Sans_Telugu,
  Plus_Jakarta_Sans,
  Sree_Krushnadevaraya,
} from "next/font/google";
import { SITE_CONFIG } from "@/config/site-config";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const sreeKrushnadevaraya = Sree_Krushnadevaraya({
  subsets: ["telugu"],
  weight: "400",
  variable: "--font-sree-krushnadevaraya",
  display: "swap",
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-telugu",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.brandName,
    template: `%s | ${SITE_CONFIG.brandName}`,
  },
  description: SITE_CONFIG.tagline,
  icons: {
    icon: { url: SITE_CONFIG.logoPath, type: "image/png" },
    apple: { url: SITE_CONFIG.logoPath, type: "image/png" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${cormorant.variable} ${sreeKrushnadevaraya.variable} ${notoTelugu.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
