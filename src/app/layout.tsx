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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.reflowapp.pro"),
  title: "Reflow Landing",
  description: "Landing page generated from Pencil selection",
  icons: {
    icon: [{ url: "/figma/icons/site-icon.png", sizes: "192x192", type: "image/png" }],
    apple: [
      { url: "/figma/icons/site-apple-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "Reflow Landing",
    description: "Landing page generated from Pencil selection",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/figma/og-image.png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflow Landing",
    description: "Landing page generated from Pencil selection",
    images: ["/figma/og-image.png"]
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
