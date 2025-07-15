"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { useToast } from "@/hooks/useToast";
import {
  User,
  MessageSquare,
  Link as LinkIcon,
  FileText,
  Copy,
  Check,
} from "lucide-react";

export default function WritePage() {
  const { address: connectedAddress } = useAccount();
  const { showSuccess, showError } = useToast();
  const [content, setContent] = useState("");
  const [giverName, setGiverName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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
    if (
      !content.trim() ||
      !giverName.trim() ||
      !connectedAddress ||
      !receiverAddress
    )
      return;

    try {
      setIsLoading(true);
      const senderAddress = connectedAddress;

      // Create message hash matching the smart contract's format
      const messageHash = keccak256(
        encodePacked(
          ["address", "address", "string", "string", "string"],
          [senderAddress, receiverAddress, content, giverName, profileUrl || ""]
        )
      );

      // Sign the message directly with personal_sign
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
        giverName,
        profileUrl: profileUrl || "",
        signature,
      };

      setSignedMessage(JSON.stringify(signedMessageJson, null, 2));
      setContent("");
      setGiverName("");
      setProfileUrl("");
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(signedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showSuccess("Copied to clipboard!");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              Invalid Request
            </h3>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create Testimonial
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Share your authentic experience and help build trust in the
            community. All testimonials are cryptographically signed for
            verification.
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-[#2a2a2a] rounded-2xl p-8 mb-8 border border-gray-800">
          <form onSubmit={handleCreateSignedMessage} className="space-y-6">
            {/* Your Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="giverName"
                className="text-sm font-medium text-gray-300 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Your Full Name
                <span className="text-red-400">*</span>
              </label>
              <input
                id="giverName"
                type="text"
                value={giverName}
                onChange={(e) => setGiverName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-[#3a3a3a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                required
              />
            </div>

            {/* Profile URL Field (Optional) */}
            <div className="space-y-2">
              <label
                htmlFor="profileUrl"
                className="text-sm font-medium text-gray-300 flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Profile URL
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                id="profileUrl"
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile (optional)"
                className="w-full bg-[#3a3a3a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              />
              <p className="text-xs text-gray-500">
                Add your LinkedIn, GitHub, or professional profile URL to
                enhance credibility
              </p>
            </div>

            {/* Testimonial Content Field */}
            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-gray-300 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Testimonial Content
                <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your honest testimonial about this person's work, skills, or character..."
                className="w-full bg-[#3a3a3a] border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                rows={6}
                required
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Be specific and authentic in your testimonial</span>
                <span
                  className={
                    content.length < 50
                      ? "text-gray-500"
                      : content.length < 200
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                >
                  {content.length} characters
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                !connectedAddress ||
                isLoading ||
                !receiverAddress ||
                !content.trim() ||
                !giverName.trim()
              }
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing Testimonial...
                </div>
              ) : (
                "Sign Testimonial"
              )}
            </button>
          </form>
        </div>

        {/* Signed Message Output */}
        {signedMessage && (
          <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                Signed Testimonial
              </h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700">
              <pre className="text-sm text-gray-300 overflow-auto whitespace-pre-wrap break-all">
                {signedMessage}
              </pre>
            </div>

            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-3 h-3 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-300 mb-1">
                    Next Steps
                  </h4>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    Share this signed testimonial with the recipient. They can
                    add it to their dashboard to display it on the blockchain as
                    a verified testimonial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
