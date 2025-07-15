"use client";
import { useState, useEffect } from "react";
import {
  Copy,
  CheckCircle,
  Loader2,
  Database,
  User,
  ExternalLink,
  Calendar,
  Shield,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, VouchMeFactory } from "@/utils/contract";
import { useToast } from "@/hooks/useToast";

interface Testimonial {
  content: string;
  fromAddress: string;
  giverName: string;
  profileUrl: string;
  timestamp: number;
  verified: boolean;
}

interface SignedTestimonial {
  senderAddress: string;
  receiverAddress: string;
  content: string;
  giverName: string;
  profileUrl: string;
  signature: string;
}

export default function Dashboard() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { showSuccess, showError } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [newTestimonial, setNewTestimonial] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTestimonials, setIsFetchingTestimonials] = useState(false);
  const [baseUrl, setBaseUrl] = useState("vouchme.stability.nexus");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingTestimonial, setPendingTestimonial] =
    useState<SignedTestimonial | null>(null);
  const [existingTestimonial, setExistingTestimonial] =
    useState<Testimonial | null>(null);

  // Helper function to get domain info from URL
  const getDomainInfo = (url: string) => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (domain.includes("linkedin.com"))
        return {
          name: "LinkedIn",
          bgClass: "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30",
        };
      if (domain.includes("github.com"))
        return {
          name: "GitHub",
          bgClass: "bg-gray-600/20 text-gray-300 hover:bg-gray-600/30",
        };
      if (domain.includes("twitter.com") || domain.includes("x.com"))
        return {
          name: "Twitter",
          bgClass: "bg-sky-500/20 text-sky-400 hover:bg-sky-500/30",
        };
      if (domain.includes("portfolio") || domain.includes("personal"))
        return {
          name: "Portfolio",
          bgClass: "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30",
        };
      return {
        name: "Profile",
        bgClass: "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30",
      };
    } catch {
      return {
        name: "Profile",
        bgClass: "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30",
      };
    }
  };

  const CONTRACT_ADDRESS =
    CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[534351];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin.replace(/^https?:\/\//, ""));
    }
  }, []);

  const shareableLink = `${baseUrl}/write?address=${address}`;
  useEffect(() => {
    const fetchTestimonials = async () => {
      if (!address) return;

      try {
        setIsFetchingTestimonials(true);
        const ethereum = window.ethereum;
        if (!ethereum) return;

        const provider = new ethers.BrowserProvider(ethereum);
        // Use TypeChain factory to create a typed contract instance
        const contract = VouchMeFactory.connect(CONTRACT_ADDRESS, provider);

        // Type-safe method call
        const testimonialIds = await contract.getReceivedTestimonials(address);

        if (!testimonialIds || testimonialIds.length === 0) {
          setTestimonials([]);
          return;
        }

        const details = await Promise.all(
          testimonialIds.map((id) => contract.getTestimonialDetails(id))
        );

        const formattedTestimonials = details.map((detail) => ({
          content: detail.content,
          fromAddress: detail.sender,
          giverName: detail.giverName,
          profileUrl: detail.profileUrl,
          timestamp: Number(detail.timestamp),
          verified: detail.verified,
        }));
        setTestimonials(formattedTestimonials);
        // Only show success toast if testimonials are actually loaded
        if (formattedTestimonials.length > 0) {
          showSuccess(
            `Successfully loaded ${formattedTestimonials.length} testimonials`
          );
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        showError("Failed to fetch testimonials");
      } finally {
        setIsFetchingTestimonials(false);
      }
    };

    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, CONTRACT_ADDRESS]);

  const handleAddTestimonial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTestimonial.trim() || !address) return;

    try {
      setIsLoading(true);
      let signedData: SignedTestimonial;
      try {
        signedData = JSON.parse(newTestimonial);
      } catch {
        showError("Invalid testimonial format. Please paste a valid JSON.");
        setIsLoading(false);
        return;
      }

      // Check if testimonial from this sender already exists
      const existingFromSender = testimonials.find(
        (testimonial) =>
          testimonial.fromAddress.toLowerCase() ===
          signedData.senderAddress.toLowerCase()
      );

      if (existingFromSender) {
        // Show confirmation modal
        setPendingTestimonial(signedData);
        setExistingTestimonial(existingFromSender);
        setShowDuplicateModal(true);
        setIsLoading(false);
        return;
      }

      // If no duplicate, proceed with adding testimonial
      await addTestimonialToBlockchain(signedData);
    } catch (error) {
      console.error("Error adding testimonial:", error);
      showError("Error adding testimonial. Please try again.");
      setIsLoading(false);
    }
  };

  const addTestimonialToBlockchain = async (signedData: SignedTestimonial) => {
    try {
      setIsLoading(true);
      const ethereum = window.ethereum;

      if (!ethereum) {
        console.error("No Ethereum provider found");
        showError("No Ethereum provider found. Please install a wallet.");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const contract = VouchMeFactory.connect(CONTRACT_ADDRESS, provider);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.createTestimonial(
        signedData.senderAddress,
        signedData.content,
        signedData.giverName,
        signedData.profileUrl,
        signedData.signature
      );

      console.log("Transaction sent:", tx.hash);

      setNewTestimonial(""); // Wait for transaction confirmation
      await tx.wait();
      showSuccess("Testimonial added successfully.");

      // Refresh testimonials
      if (address) {
        const testimonialIds = await contract.getReceivedTestimonials(address);

        if (testimonialIds && testimonialIds.length > 0) {
          const details = await Promise.all(
            testimonialIds.map((id) => contract.getTestimonialDetails(id))
          );

          const formattedTestimonials = details.map((detail) => ({
            content: detail.content,
            fromAddress: detail.sender,
            giverName: detail.giverName,
            profileUrl: detail.profileUrl,
            timestamp: Number(detail.timestamp),
            verified: detail.verified,
          }));

          setTestimonials(formattedTestimonials);
        }
      }
    } catch (error) {
      console.error("Error adding testimonial:", error);
      showError("Error adding testimonial. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReplace = async () => {
    if (pendingTestimonial) {
      setShowDuplicateModal(false);
      await addTestimonialToBlockchain(pendingTestimonial);
      setPendingTestimonial(null);
      setExistingTestimonial(null);
    }
  };

  const handleCancelReplace = () => {
    setShowDuplicateModal(false);
    setPendingTestimonial(null);
    setExistingTestimonial(null);
    setIsLoading(false);
  };

  // Function to truncate address/text
  const truncateText = (text: string, startLength = 6, endLength = 4) => {
    if (!text) return "";
    if (text.length <= startLength + endLength) return text;
    return `${text.slice(0, startLength)}...${text.slice(-endLength)}`;
  };
  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // loading skeleton for testimonials
  const TestimonialsSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#2a2a2a] rounded-xl p-6 overflow-hidden relative"
        >
          <div className="animate-pulse">
            {/* Content shimmer */}
            <div className="h-4 bg-[#3a3a3a] rounded w-full mb-3"></div>
            <div className="h-4 bg-[#3a3a3a] rounded w-[90%] mb-3"></div>
            <div className="h-4 bg-[#3a3a3a] rounded w-[75%] mb-8"></div>

            {/* Footer shimmer */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#3a3a3a]"></div>
                <div className="h-3 bg-[#3a3a3a] rounded w-24"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 bg-[#3a3a3a] rounded w-16"></div>
                <div className="h-3 bg-[#3a3a3a] rounded w-16"></div>
              </div>
            </div>
          </div>
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shine"></div>
        </div>
      ))}
    </>
  );

  // loading skeleton for stats card
  const StatsCardSkeleton = () => (
    <div className="bg-gradient-to-br from-indigo-600/70 to-indigo-700/70 rounded-xl p-6 flex items-center justify-between relative overflow-hidden">
      <div className="animate-pulse">
        <div className="h-5 bg-white/20 rounded w-32 mb-3"></div>
        <div className="h-8 bg-white/20 rounded w-16"></div>
      </div>
      <div className="h-16 w-16 bg-white/10 rounded-full animate-pulse"></div>
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shine"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>{" "}
        {/* Top Row - Stats and Collection Link */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {/* Stats Card */}{" "}
          {isFetchingTestimonials ? (
            <StatsCardSkeleton />
          ) : (
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 flex items-center justify-between fade-in">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Total Testimonials
                </h2>
                <div className="text-4xl font-bold">{testimonials.length}</div>
              </div>
              <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-white" />
              </div>
            </div>
          )}
          {/* Collection Link Card */}
          <div className="bg-[#2a2a2a] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your Collection Link</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#3a3a3a] rounded-lg px-4 py-3 font-mono text-sm overflow-hidden">
                {truncateText(shareableLink, 24, 8)}
              </div>
              <button
                onClick={copyLink}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                <span className="hidden sm:inline">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* Add Testimonial Section */}
        <div className="bg-[#2a2a2a] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Signed Testimonial</h2>
          <form onSubmit={handleAddTestimonial} className="space-y-4">
            <input
              type="text"
              value={newTestimonial}
              onChange={(e) => setNewTestimonial(e.target.value)}
              placeholder="Paste signed testimonial here"
              className="w-full bg-[#3a3a3a] rounded-lg p-4 text-white border border-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-indigo-400"
            >
              {isLoading ? "Processing..." : "Add to Blockchain"}
            </button>
          </form>
        </div>{" "}
        {/* Testimonials Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">My Testimonials</h2>{" "}
          {isFetchingTestimonials && (
            <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 py-1.5 px-3 rounded-full">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">
                Syncing with blockchain
              </span>
              <Database size={14} className="ml-1 animate-pulse" />
            </div>
          )}
        </div>
        <div className="space-y-6">
          {isFetchingTestimonials ? (
            <TestimonialsSkeleton />
          ) : testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#2d2d2d] transition-colors fade-in border border-[#3a3a3a]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header with giver info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {testimonial.giverName || "Anonymous"}
                      </h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-mono text-gray-400">
                          {truncateText(testimonial.fromAddress)}
                        </span>
                        {testimonial.profileUrl && (
                          <a
                            href={testimonial.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                              getDomainInfo(testimonial.profileUrl).bgClass
                            }`}
                          >
                            <ExternalLink size={11} />
                            {getDomainInfo(testimonial.profileUrl).name}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
                    <Shield size={14} />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                </div>

                {/* Testimonial content */}
                <div className="mb-4">
                  <p className="text-gray-100 leading-relaxed text-lg">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>

                {/* Footer with timestamp */}
                <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-[#3a3a3a]">
                  <Calendar size={14} />
                  <span>
                    {new Date(testimonial.timestamp * 1000).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#2a2a2a] rounded-xl p-8 text-center fade-in">
              <p className="text-gray-400">
                No testimonials yet. Share your link to collect testimonials!
              </p>
            </div>
          )}
        </div>
        {/* Duplicate Testimonial Modal */}
        {showDuplicateModal && existingTestimonial && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-2xl border border-[#3a3a3a] max-w-md w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle size={20} className="text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Replace Existing Testimonial?
                  </h3>
                </div>
                <button
                  onClick={handleCancelReplace}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-gray-300 mb-4">
                  You already have a testimonial from{" "}
                  <span className="font-semibold text-white">
                    {existingTestimonial.giverName || "this person"}
                  </span>
                  . Adding this new testimonial will replace the existing one.
                </p>

                {/* Existing Testimonial Preview */}
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#3a3a3a] mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">Current:</span>
                    <span className="text-sm font-medium text-white">
                      {existingTestimonial.giverName || "Anonymous"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    &ldquo;{existingTestimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>
                      {new Date(
                        existingTestimonial.timestamp * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-6">
                  This action cannot be undone. The blockchain will only store
                  the most recent testimonial from each person.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 p-6 border-t border-[#3a3a3a]">
                <button
                  onClick={handleCancelReplace}
                  className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReplace}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Replace Testimonial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
