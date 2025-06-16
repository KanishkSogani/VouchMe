"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";
import WalletLock from "@/components/WalletLock";

interface ProtectedRouteProviderProps {
  children: ReactNode;
}

const ProtectedRouteProvider: React.FC<ProtectedRouteProviderProps> = ({
  children,
}) => {
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const publicRoutes = ["/"];

  const isPublicRoute = publicRoutes.includes(pathname);

  // Loading delay to prevent flash of content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If the route is public or the user is connected, render the children
  if (isPublicRoute || isConnected) {
    return <>{children}</>;
  }

  // Otherwise, show the wallet lock screen
  return <WalletLock />;
};

export default ProtectedRouteProvider;
