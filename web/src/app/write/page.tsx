"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { useToast } from "@/hooks/useToast";

export default function WritePage() {
  const { address: connectedAddress } = useAccount();
  const { showSuccess, showError } = useToast();
  const [content, setContent] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState<`0x${string}` | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Extract address from query string
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressFromQuery = urlParams.get("address");
    if (addressFromQuery && addressFromQuery.startsWith("0x")) {
      setReceiverAddress(addressFromQuery as `0x${string}`);
    } else {
      const errorMessage =
        "Invalid or missing Ethereum address in URL query parameter 'address'";
      setError(errorMessage);
      showError(errorMessage);
      setIsLoading(false);
    }
  }, [showError]);

  const handleCreateSignedMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !connectedAddress || !receiverAddress) return;

    try {
      setIsLoading(true);
      const senderAddress = connectedAddress;

      // Create message hash matching the smart contract's format
      const messageHash = keccak256(
        encodePacked(
          ["address", "address", "string"],
          [senderAddress, receiverAddress, content]
        )
      ); // Sign the message directly with personal_sign
      const ethereum = window.ethereum;
      if (!ethereum) {
        const errorMessage =
          "No Ethereum provider found. Please install a wallet.";
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      const signature = await ethereum.request({
        method: "personal_sign",
        params: [messageHash, senderAddress],
      });

      const signedMessageJson = {
        senderAddress,
        receiverAddress,
        content,
        signature,
      };
      setSignedMessage(JSON.stringify(signedMessageJson, null, 2));
      setContent("");
      showSuccess("Testimonial signed successfully!");
    } catch (error) {
      console.error("Error creating signed message:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create signed message. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Create Signed Testimonial</h1>
        <form onSubmit={handleCreateSignedMessage} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter testimonial content"
            className="w-full bg-gray-800 rounded-lg p-4 text-white border border-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors h-32"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-indigo-400"
            disabled={!connectedAddress || isLoading || !receiverAddress}
          >
            {isLoading ? "Signing..." : "Sign Testimonial"}
          </button>
        </form>
        {signedMessage && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Signed Testimonial</h2>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-auto">
              {signedMessage}
            </pre>
            <div className="mt-4">
              <p className="text-gray-400 mb-2">
                Share this signed testimonial with the testimonial receiver.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(signedMessage);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
