import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/utils/crypto-polyfill";
import { WalletProvider } from "@/hooks/WalletProvider";
import ProtectedRouteProvider from "@/hooks/ProtectedRouteProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VouchMe",
  description:
    "VouchMe is a blockchain-based testimonial platform that enables users to provide testimonials securely and transparently, building a transparent and verifiable reputation system.",
  keywords:
    "VouchMe, decentralized trust, reputation system, testimonials, blockchain, vouching, secure, Web3, Stability Nexus",
  robots: "index, follow",
  openGraph: {
    title: "VouchMe - Blockchain Testimonial Platform",
    description:
      "VouchMe is a blockchain-based testimonial platform that enables users to provide testimonials securely and transparently, building a transparent and verifiable reputation system.",
    siteName: "VouchMe",
    images: [
      {
        url: "/vouchme.png",
        width: 1200,
        height: 630,
        alt: "VouchMe - Blockchain based Testimonial Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VouchMe - Blockchain based Testimonial Platform",
    description:
      "VouchMe is a blockchain-based testimonial platform that enables users to provide testimonials securely and transparently, building a transparent and verifiable reputation system.",
    images: ["/VouchMe.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {" "}
        <WalletProvider>
          <ProtectedRouteProvider>{children}</ProtectedRouteProvider>
        </WalletProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
