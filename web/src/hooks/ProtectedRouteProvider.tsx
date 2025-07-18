"use client";

import React, { ReactNode } from "react";
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

  const publicRoutes = ["/"];

  const isPublicRoute = publicRoutes.includes(pathname);

  // If the route is public or the user is connected, render the children
  if (isPublicRoute || isConnected) {
    return <>{children}</>;
  }

  // Otherwise, show the wallet lock screen
  return <WalletLock />;
};

export default ProtectedRouteProvider;
