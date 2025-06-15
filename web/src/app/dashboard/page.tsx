"use client";
import { useState, useEffect } from "react";
import { Copy, CheckCircle, Loader2, Database } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, VouchMeFactory } from "@/utils/contract";

interface Testimonial {
  content: string;
  fromAddress: string;
  timestamp: number;
  verified: boolean;
}

interface SignedTestimonial {
  senderAddress: string;
  receiverAddress: string;
  content: string;
  signature: string;
}

export default function Dashboard() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [newTestimonial, setNewTestimonial] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTestimonials, setIsFetchingTestimonials] = useState(false);
  const [baseUrl, setBaseUrl] = useState("vouchme.stability.nexus");

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
          timestamp: Number(detail.timestamp),
          verified: detail.verified,
        }));

        setTestimonials(formattedTestimonials);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsFetchingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, [address, CONTRACT_ADDRESS]);

  const handleAddTestimonial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTestimonial.trim() || !address) return;

    try {
      setIsLoading(true);
      const signedData: SignedTestimonial = JSON.parse(newTestimonial);
      const ethereum = window.ethereum;

      if (!ethereum) {
        console.error("No Ethereum provider found");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const contract = VouchMeFactory.connect(CONTRACT_ADDRESS, provider);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.createTestimonial(
        signedData.senderAddress,
        signedData.content,
        signedData.signature
      );

      console.log("Transaction sent:", tx.hash);
      setNewTestimonial("");

      // Wait for transaction confirmation
      await tx.wait();

      // Refresh testimonials
      const testimonialIds = await contract.getReceivedTestimonials(address);

      if (testimonialIds && testimonialIds.length > 0) {
        const details = await Promise.all(
          testimonialIds.map((id) => contract.getTestimonialDetails(id))
        );

        const formattedTestimonials = details.map((detail) => ({
          content: detail.content,
          fromAddress: detail.sender,
          timestamp: Number(detail.timestamp),
          verified: detail.verified,
        }));

        setTestimonials(formattedTestimonials);
      }
    } catch (error) {
      console.error("Error adding testimonial:", error);
    } finally {
      setIsLoading(false);
    }
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
                className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#2d2d2d] transition-colors fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-lg mb-6">{testimonial.content}</p>
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                      <span className="font-mono text-xs">From</span>
                    </div>
                    <span className="font-mono">
                      {truncateText(testimonial.fromAddress)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      {new Date(
                        testimonial.timestamp * 1000
                      ).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Verified
                    </div>
                  </div>
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
      </div>
    </div>
  );
}
