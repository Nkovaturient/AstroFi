import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../walletContext/WalletConnect";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AstroFi - Decentralized Space Research Funding",
  description: "Fund the future of space exploration through blockchain technology. Support groundbreaking research missions and earn exclusive NFT rewards.",
  keywords: "space research, blockchain, crowdfunding, stellar, NFT, space exploration",
  authors: [{ name: "AstroFi Team" }],
  openGraph: {
    title: "AstroFi - Decentralized Space Research Funding",
    description: "Fund the future of space exploration through blockchain technology.",
    type: "website",
    url: "https://astrofi.space",
    images: [
      {
        url: "/cosmos1.webp",
        width: 1200,
        height: 630,
        alt: "AstroFi - Space Research Funding Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AstroFi - Decentralized Space Research Funding",
    description: "Fund the future of space exploration through blockchain technology.",
    images: ["/cosmos1.webp"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-white`}
      >
        <WalletProvider>
          <ToastProvider>
            <Analytics />
            <Navbar />
            <main className="relative">
              {children}
            </main>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}