"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const Navbar = ({
  toggleWalletConfig,
  useEnhancedConfig,
}: {
  toggleWalletConfig: () => void;
  useEnhancedConfig: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const pathname = usePathname();

  const isAuthenticated = !!address;
  const isLandingPage = pathname === "/";

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-[#171717]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="text-white text-2xl font-bold">
            VouchMe
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLandingPage && (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-300 hover:text-white transition-colors font-semibold"
                >
                  Why VouchMe
                </button>
                <button
                  onClick={() => scrollToSection("footer")}
                  className="text-gray-300 hover:text-white transition-colors font-semibold"
                >
                  About Us
                </button>
              </>
            )}

            {!isAuthenticated && (
              <button
                onClick={toggleWalletConfig}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {useEnhancedConfig
                  ? "Disable ReOwn Wallets"
                  : "Enable ReOwn Wallets"}
              </button>
            )}

            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-3">
              {isLandingPage && (
                <>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Why VouchMe
                  </button>
                  <button
                    onClick={() => scrollToSection("footer")}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    About Us
                  </button>
                </>
              )}

              {!isLandingPage && isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}

              {!isAuthenticated && (
                <button
                  onClick={toggleWalletConfig}
                  className="block w-auto text-left px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                >
                  {useEnhancedConfig
                    ? "Disable ReOwn Wallets"
                    : "Enable ReOwn Wallets"}
                </button>
              )}

              <div className="py-2">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
