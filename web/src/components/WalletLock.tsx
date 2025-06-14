"use client";
import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter, usePathname } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WalletLock = () => {
  const router = useRouter();
  const pathname = usePathname();

  const goToHome = () => {
    router.push("/");
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-[#171717] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        {" "}
        <Card className="bg-[#262626] border-gray-700 overflow-hidden shadow-xl transform transition-all">
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <CardContent className="p-8">
            {" "}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Connect Your Wallet
              </h1>
              <p className="text-gray-400 mb-8">
                Please connect your wallet to access{" "}
                {pathname === "/" ? "this page" : "this section"}.
              </p>
              <div className="mb-6 w-full">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          "aria-hidden": true,
                          style: {
                            opacity: 0,
                            pointerEvents: "none",
                            userSelect: "none",
                          },
                        })}
                        className="w-full flex justify-center"
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors shadow-md"
                              >
                                Connect Wallet
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-colors shadow-md"
                              >
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <div className="flex flex-col gap-3 w-full">
                              {" "}
                              <button
                                onClick={openAccountModal}
                                type="button"
                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors shadow-md"
                              >
                                {account.displayName}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>{" "}
              <button
                onClick={goToHome}
                className="flex items-center text-gray-500 hover:text-gray-300 text-sm transition-colors mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Return to Homepage
              </button>
            </div>{" "}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletLock;
