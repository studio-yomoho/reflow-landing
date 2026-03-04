import "./globals.css";
import { Inter, Unbounded } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap"
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800", "900"],
  variable: "--font-unbounded",
  display: "swap"
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.reflowapp.pro";
const OG_IMAGE_PATH = "/figma/og.jpg?v=20260304-1";
const SITE_TITLE = "Reflow — Webflow без блокировок в России";
const SITE_DESCRIPTION =
  "Сервис публикации ваших Webflow сайтов в российский контур. 100% доступность, лучшая скорость, без VPN.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: [{ url: "/figma/icons/site-icon.png", sizes: "192x192", type: "image/png" }],
    apple: [
      { url: "/figma/icons/site-apple-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    url: SITE_URL,
    siteName: "Reflow",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: SITE_TITLE
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${unbounded.variable} h-full`}>
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
