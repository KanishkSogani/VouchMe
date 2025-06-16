"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useChainId } from "wagmi";
import { CONTRACT_ADDRESSES, VouchMeFactory } from "@/utils/contract";
import { useToast } from "@/hooks/useToast";

interface Testimonial {
  content: string;
  fromAddress: string;
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
    const addressFromQuery = urlParams.get("address");    if (addressFromQuery && addressFromQuery.startsWith("0x")) {
      setAddress(addressFromQuery as `0x${string}`);
    } else {
      const errorMessage = "Invalid or missing Ethereum address in URL query parameter 'address'";
      setError(errorMessage);
      showError(errorMessage);
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      if (!address) return;

      try {        const ethereum = window.ethereum;
        if (!ethereum) {
          const errorMessage = "No Ethereum provider found. Please install a wallet.";
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
          timestamp: Number(detail.timestamp),
          verified: detail.verified,
        }));        setTestimonials(formattedTestimonials);
        showSuccess(`Successfully loaded ${formattedTestimonials.length} testimonials`);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        const errorMessage = "Failed to fetch testimonials. Please try again later.";
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, CONTRACT_ADDRESS]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
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
                className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#2d2d2d] transition-colors"
              >
                <p className="text-lg mb-6">{testimonial.content}</p>
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                      <span className="font-mono text-xs">From</span>
                    </div>
                    <span className="font-mono">
                      {truncateAddress(testimonial.fromAddress)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      {formatDate(testimonial.timestamp)}
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
