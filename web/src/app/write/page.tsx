"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { ethers } from "ethers";
import { useToast } from "@/hooks/useToast";
import { CONTRACT_ADDRESSES, VouchMeFactory } from "@/utils/contract";
import {
  User,
  MessageSquare,
  Link as LinkIcon,
  FileText,
  Copy,
  Check,
  Mail,
  AlertTriangle,
} from "lucide-react";

interface Profile {
  name: string;
  contact: string;
  bio: string;
}

export default function WritePage() {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();
  const { showSuccess, showError } = useToast();
  const [content, setContent] = useState("");
  const [giverName, setGiverName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState<`0x${string}` | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<Profile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Extract address from query string and fetch profile
  useEffect(() => {
    const CONTRACT_ADDRESS =
      CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[534351];

    const fetchReceiverProfile = async (address: string) => {
      try {
        setProfileLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = VouchMeFactory.connect(CONTRACT_ADDRESS, provider);

        const userProfile = await contract.userProfiles(address);
        const profile = {
          name: userProfile.name,
          contact: userProfile.contact,
          bio: userProfile.bio,
        };

        setReceiverProfile(profile);

        // Check if profile is complete (all fields must have content)
        const complete =
          profile.name.trim() !== "" &&
          profile.contact.trim() !== "" &&
          profile.bio.trim() !== "";
        setIsProfileComplete(complete);

        if (!complete) {
          const errorMessage =
            "The user's profile is incomplete. They need to complete their profile before receiving testimonials.";
          setError(errorMessage);
          showError(errorMessage);
        }
      } catch (error) {
        console.error("Error fetching receiver profile:", error);
        showError("Failed to load user profile");
      } finally {
        setProfileLoading(false);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const addressFromQuery = urlParams.get("address");
    if (addressFromQuery && addressFromQuery.startsWith("0x")) {
      const address = addressFromQuery as `0x${string}`;
      setReceiverAddress(address);
      fetchReceiverProfile(address);
    } else {
      const errorMessage =
        "Invalid or missing Ethereum address in URL query parameter 'address'";
      setError(errorMessage);
      showError(errorMessage);
      setIsLoading(false);
      setProfileLoading(false);
    }
  }, [chainId, showError]);

  const handleCreateSignedMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !content.trim() ||
      !giverName.trim() ||
      !connectedAddress ||
      !receiverAddress ||
      !isProfileComplete
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

  if (error || (receiverAddress && !profileLoading && !isProfileComplete)) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              {!isProfileComplete ? "Profile Incomplete" : "Invalid Request"}
            </h3>
            <p className="text-red-400">
              {!isProfileComplete
                ? "This user's profile is incomplete. They need to complete their profile before receiving testimonials."
                : error}
            </p>
            {!isProfileComplete && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  Please ask the user to complete their profile in the profile section before creating a testimonial.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Create Testimonial
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Share your authentic experience and help build trust in the
            community
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section - Left Side */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            {/* Recipient Profile Card */}
            {receiverProfile && !profileLoading && (
              <div className="bg-[#2a2a2a] rounded-2xl p-5 border border-gray-800">
                <div className="text-center">
                  {/* Profile Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <User className="w-7 h-7 text-gray-200" />
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {receiverProfile.name}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="font-medium">Verified</span>
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div className="text-left space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-gray-500 rounded-full"></div>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          About
                        </span>
                      </div>
                      <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-700/30">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {receiverProfile.bio}
                        </p>
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="text-left space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-gray-500 rounded-full"></div>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Contact
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300 text-sm p-3 bg-gray-800/20 rounded-lg border border-gray-700/30">
                        <Mail className="w-4 h-4 flex-shrink-0 text-gray-500" />
                        <span className="truncate">
                          {receiverProfile.contact}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-700/50">
                      <div className="flex items-center justify-center gap-2 text-blue-400 text-xs">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Eligible to receive testimonials</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state for profile */}
            {profileLoading && (
              <div className="bg-[#2a2a2a] rounded-2xl p-5 border border-gray-800 sticky top-8">
                <div className="animate-pulse text-center">
                  <div className="w-14 h-14 bg-gray-600 rounded-full mx-auto mb-3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-600 rounded w-2/3 mx-auto"></div>
                    <div className="h-4 bg-gray-600 rounded w-1/3 mx-auto"></div>
                    <div className="space-y-2 mt-4">
                      <div className="h-3 bg-gray-600 rounded w-1/3"></div>
                      <div className="h-10 bg-gray-600 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-600 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-600 rounded"></div>
                    </div>
                    <div className="h-3 bg-gray-600 rounded w-2/3 mx-auto"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Section - Right Side */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-800">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Write Your Testimonial
                </h2>
                <p className="text-gray-400 text-sm">
                  Share your honest experience and feedback
                </p>
              </div>

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
                    className="w-full bg-[#3a3a3a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all duration-200"
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
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full bg-[#3a3a3a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500">
                    Add your LinkedIn, GitHub, or professional profile URL for
                    credibility
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
                    className="w-full bg-[#3a3a3a] border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 resize-none"
                    rows={8}
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
                    !giverName.trim() ||
                    !isProfileComplete ||
                    profileLoading
                  }
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing Testimonial...
                    </div>
                  ) : !isProfileComplete ? (
                    "Profile Incomplete - Cannot Create Testimonial"
                  ) : (
                    "Sign Testimonial"
                  )}
                </button>
              </form>
            </div>

            {/* Signed Message Output */}
            {signedMessage && (
              <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-800 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    Signed Testimonial
                  </h3>
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

                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700 mb-4">
                  <pre className="text-sm text-gray-300 overflow-auto whitespace-pre-wrap break-all">
                    {signedMessage}
                  </pre>
                </div>

                <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-3 h-3 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">
                        Next Steps
                      </h4>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Share this signed testimonial with the recipient. They
                        can add it to their dashboard to display it on the
                        blockchain as a verified testimonial.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
