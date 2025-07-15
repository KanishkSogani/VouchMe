"use client";

import { useState, useEffect } from "react";
import { User, ExternalLink, Calendar, Shield } from "lucide-react";
import { ethers } from "ethers";
import { useChainId } from "wagmi";
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

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chainId = useChainId();
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const { showSuccess, showError } = useToast();

  const CONTRACT_ADDRESS =
    CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[534351];

  // Extract address from query string
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressFromQuery = urlParams.get("address");
    if (addressFromQuery && addressFromQuery.startsWith("0x")) {
      setAddress(addressFromQuery as `0x${string}`);
    } else {
      const errorMessage =
        "Invalid or missing Ethereum address in URL query parameter 'address'";
      setError(errorMessage);
      showError(errorMessage);
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      if (!address) return;

      try {
        const ethereum = window.ethereum;
        if (!ethereum) {
          const errorMessage =
            "No Ethereum provider found. Please install a wallet.";
          setError(errorMessage);
          showError(errorMessage);
          return;
        }

        const provider = new ethers.BrowserProvider(ethereum);
        const contract = VouchMeFactory.connect(CONTRACT_ADDRESS, provider);

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
        showSuccess(
          `Successfully loaded ${formattedTestimonials.length} testimonials`
        );
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        const errorMessage =
          "Failed to fetch testimonials. Please try again later.";
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, CONTRACT_ADDRESS]);

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

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading testimonials...</p>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Public Testimonials</h1>
          <p className="text-gray-400">
            Viewing testimonials for{" "}
            {address ? truncateAddress(address) : "unknown address"}
          </p>
          <div className="mt-2 text-sm">
            <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full">
              {testimonials.length} Testimonials
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#2d2d2d] transition-colors border border-[#3a3a3a]"
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
                          {truncateAddress(testimonial.fromAddress)}
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
            <div className="bg-[#2a2a2a] rounded-xl p-8 text-center">
              <p className="text-gray-400">
                No testimonials found for this address.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
