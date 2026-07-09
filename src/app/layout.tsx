import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteBeacon } from "@/components/analytics/SiteBeacon";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

// Brand consolidation: the codebase still references --font-space-grotesk and
// --font-dm-sans in ~220 places. Map those variables to the brand fonts
// (Outfit display / Inter body) so every usage renders compliant type with no
// per-call edit. Space Grotesk + DM Sans are no longer loaded.
const outfitAlias = Outfit({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const interAlias = Inter({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

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
  themeColor: "#0E4F4F",
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
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${outfitAlias.variable} ${interAlias.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SiteBeacon />
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
