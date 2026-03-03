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
  openGraph: {
    title: "Reflow Landing",
    description: "Landing page generated from Pencil selection",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflow Landing",
    description: "Landing page generated from Pencil selection",
    images: ["/og-image.png"]
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
