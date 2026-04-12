import type { Metadata } from "next";
import { WaitlistClient } from "@/components/waitlist/WaitlistClient";

export const metadata: Metadata = {
  title: "Join the Waitlist — GigMiles",
  description:
    "Track your REAL net profit as a gig driver. See what DoorDash doesn't show you — depreciation, gas, taxes. Join 1,000+ drivers on the early access waitlist.",
  openGraph: {
    title: "Join the GigMiles Waitlist",
    description:
      "Stop losing money. See your real net profit after depreciation, gas, insurance, and taxes. Launching soon.",
    url: "https://gigmiles.app/waitlist",
    siteName: "GigMiles",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the GigMiles Waitlist",
    description: "Stop losing money. See your real net profit after all expenses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WaitlistPage() {
  return <WaitlistClient />;
}
