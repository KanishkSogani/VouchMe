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
    "VouchMe is a blockchain-based testimonial system that enables users to provide testimonials securely and transparently, building a transparent and verifiable reputation system.",
  keywords:
    "VouchMe, decentralized trust, reputation system, testimonials, blockchain, vouching, secure, Web3, Stability Nexus",
  robots: "index, follow",
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
