import type { Metadata } from "next";
import { Providers } from "@/providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AquaDex — Flow Deeper on Monad",
  description: "The premier hybrid DEX on Monad. Trade, provide liquidity, and earn with Classic and Concentrated Liquidity pools.",
  keywords: ["DEX", "DeFi", "Monad", "AMM", "swap", "liquidity"],
  openGraph: {
    title: "AquaDex — Flow Deeper on Monad",
    description: "Hybrid V2+V3 DEX on Monad Mainnet",
    images: ["/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AquaDex",
    description: "Flow Deeper on Monad",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: "var(--font-body)" }}>
        <Providers>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
