import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SiteBeacon } from "@/components/analytics/SiteBeacon";
import { RedditPixel } from "@/components/analytics/RedditPixel";
import { LocalDesignReview } from "@/components/editorial/LocalDesignReview";

// Inter is only used by the legacy Tailwind pages (/ebike, /cheatsheet,
// /getgigmiles, callbacks). Every indexed editorial page renders Outfit, so
// Inter is not preloaded on them.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

// viewport-fit=cover makes env(safe-area-inset-*) real on notched phones;
// themeColor lives here (Next 16 warns when it sits in metadata).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b302b",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gigmiles.app"),
  title: "GigMiles — Know What You Actually Earn",
  description:
    "Stop guessing your net profit. GigMiles tracks real earnings, vehicle costs, mileage deductions, and taxes for Uber, DoorDash, Lyft, and Amazon Flex drivers.",
  keywords: [
    "gig worker app",
    "rideshare earnings tracker",
    "DoorDash mileage tracker",
    "Uber driver expenses",
    "self-employment tax calculator",
    "gig economy income",
    "delivery driver app",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GigMiles",
  },
  openGraph: {
    type: "website",
    url: "https://gigmiles.app",
    title: "GigMiles — Know What You Actually Earn",
    description:
      "Real-time earnings intelligence for gig drivers. Track net profit, mileage deductions, vehicle costs, and taxes — all in one app.",
    siteName: "GigMiles",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GigMiles — Gig Worker Earnings Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GigMiles — Know What You Actually Earn",
    description:
      "Real-time earnings intelligence for gig drivers. Track net profit, mileage, vehicle costs, and taxes.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://gigmiles.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localReview = process.env.LOCAL_DESIGN_REVIEW === '1' && process.env.NODE_ENV !== 'production';
  return (
    <html lang="en" className="antialiased dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        {!localReview && <SiteBeacon />}
        {!localReview && <RedditPixel />}
        <LocalDesignReview enabled={localReview}>{children}</LocalDesignReview>
      </body>
    </html>
  );
}
