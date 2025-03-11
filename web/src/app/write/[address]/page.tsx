"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { keccak256, encodePacked } from "viem";

export default function WritePage() {
  const { address: connectedAddress } = useAccount();
  const [content, setContent] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const receiverAddress = params?.address as `0x${string}`;

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
      );

      // Sign the message directly with personal_sign
      const ethereum = window.ethereum;
      if (!ethereum) {
        throw new Error("No Ethereum provider found");
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
    } catch (error) {
      console.error("Error creating signed message:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            disabled={!connectedAddress || isLoading}
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
