"use client";

import { useState, useEffect } from "react";
import {
  User,
  ExternalLink,
  Calendar,
  Shield,
  Mail,
  AlertTriangle,
} from "lucide-react";
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

interface Profile {
  name: string;
  contact: string;
  bio: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chainId = useChainId();
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const { showSuccess, showError } = useToast();

  const CONTRACT_ADDRESS =
    CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[534351];

  // Extract address from query string and fetch profile
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
      setProfileLoading(false);
    }
  }, [showError]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) return;

      try {
        setProfileLoading(true);
        const ethereum = window.ethereum;
        if (!ethereum) {
          console.warn("No Ethereum provider found");
          return;
        }

        const provider = new ethers.BrowserProvider(ethereum);
        const contract = VouchMeFactory.connect(CONTRACT_ADDRESS, provider);

        const userProfile = await contract.userProfiles(address);
        setProfile({
          name: userProfile.name,
          contact: userProfile.contact,
          bio: userProfile.bio,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Don't show error for profile fetch as it's not critical
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [address, CONTRACT_ADDRESS]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      if (!address) return;

      // Wait for profile to load first
      if (profileLoading) return;

      // Don't fetch testimonials if profile is incomplete or null
      if (!profile || !profile.name || !profile.bio || !profile.contact) {
        setIsLoading(false);
        return;
      }

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
        if (formattedTestimonials.length > 0) {
          showSuccess(
            `Successfully loaded ${formattedTestimonials.length} testimonials`
          );
        }
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
  }, [address, CONTRACT_ADDRESS, profile, profileLoading]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section Skeleton */}
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-10 bg-[#2a2a2a] rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-[#2a2a2a] rounded-lg w-96 mx-auto"></div>
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-[#2a2a2a] rounded-2xl p-5 border border-gray-800 relative overflow-hidden">
                <div className="animate-pulse text-center">
                  <div className="w-14 h-14 bg-[#3a3a3a] rounded-full mx-auto mb-3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-[#3a3a3a] rounded w-2/3 mx-auto"></div>
                    <div className="h-4 bg-[#3a3a3a] rounded w-1/3 mx-auto"></div>
                    <div className="space-y-2 mt-4">
                      <div className="h-3 bg-[#3a3a3a] rounded w-1/3"></div>
                      <div className="h-10 bg-[#3a3a3a] rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-[#3a3a3a] rounded w-1/3"></div>
                      <div className="h-8 bg-[#3a3a3a] rounded"></div>
                    </div>
                    <div className="h-3 bg-[#3a3a3a] rounded w-2/3 mx-auto"></div>
                  </div>
                </div>
                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shine"></div>
              </div>
            </div>

            {/* Testimonials Content Skeleton */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#1f1f1f] rounded-xl p-6 border border-[#3a3a3a] relative overflow-hidden"
                  >
                    <div className="animate-pulse">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-[#3a3a3a]"></div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3a3a3a] rounded-full"></div>
                          </div>
                          <div>
                            <div className="h-5 bg-[#3a3a3a] rounded w-32 mb-2"></div>
                            <div className="flex items-center gap-3">
                              <div className="h-4 bg-[#3a3a3a] rounded w-20"></div>
                              <div className="h-4 bg-[#3a3a3a] rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-[#3a3a3a] rounded w-20 mb-1"></div>
                          <div className="h-3 bg-[#3a3a3a] rounded w-16"></div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3 mb-6">
                        <div className="h-4 bg-[#3a3a3a] rounded w-full"></div>
                        <div className="h-4 bg-[#3a3a3a] rounded w-[95%]"></div>
                        <div className="h-4 bg-[#3a3a3a] rounded w-[80%]"></div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#3a3a3a]">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[#3a3a3a] rounded"></div>
                          <div className="h-3 bg-[#3a3a3a] rounded w-16"></div>
                        </div>
                        <div className="h-6 bg-[#3a3a3a] rounded w-20"></div>
                      </div>
                    </div>
                    {/* Shimmer effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shine"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-red-400" />
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

  // Check if profile is incomplete after loading
  if (
    !isLoading &&
    !profileLoading &&
    address &&
    (!profile || !profile.name || !profile.bio || !profile.contact)
  ) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              Profile Incomplete
            </h3>
            <p className="text-red-400">
              This user&apos;s profile is incomplete. They need to complete
              their profile before receiving testimonials.
            </p>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                Please ask the user to complete their profile in the profile
                section before viewing testimonials.
              </p>
            </div>
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
          <h1 className="text-4xl font-bold mb-4 text-white">Testimonials</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Authentic feedback and recommendations from verified connections
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1f1f1f] rounded-2xl p-5 border border-[#3a3a3a] hover:border-indigo-500/50 transition-all duration-200 lg:sticky lg:top-8 shadow-xl">
              {profileLoading ? (
                <div className="animate-pulse text-center">
                  <div className="w-14 h-14 bg-[#3a3a3a] rounded-full mx-auto mb-3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-[#3a3a3a] rounded w-2/3 mx-auto"></div>
                    <div className="h-4 bg-[#3a3a3a] rounded w-1/3 mx-auto"></div>
                    <div className="space-y-2 mt-4">
                      <div className="h-3 bg-[#3a3a3a] rounded w-1/3"></div>
                      <div className="h-10 bg-[#3a3a3a] rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-[#3a3a3a] rounded w-1/3"></div>
                      <div className="h-8 bg-[#3a3a3a] rounded"></div>
                    </div>
                    <div className="h-3 bg-[#3a3a3a] rounded w-2/3 mx-auto"></div>
                  </div>
                </div>
              ) : profile &&
                (profile.name || profile.bio || profile.contact) ? (
                <div className="text-center">
                  {/* Profile Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {profile.name || "Professional User"}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="font-medium">Verified</span>
                      </div>
                    </div>

                    {/* Bio Section */}
                    {profile.bio && (
                      <div className="text-left space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                          <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">
                            About
                          </span>
                        </div>
                        <div className="bg-[#2a2a2a] rounded-lg p-3 border border-indigo-500/20">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {profile.bio}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contact Section */}
                    {profile.contact && (
                      <div className="text-left space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                          <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">
                            Contact
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 text-sm p-3 bg-[#2a2a2a] rounded-lg border border-indigo-500/20">
                          <Mail className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                          <span className="truncate">{profile.contact}</span>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="pt-3 border-t border-[#3a3a3a]">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {testimonials.length}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">
                          Testimonials
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {address ? truncateAddress(address) : "Unknown User"}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-gray-400 text-xs bg-gray-500/10 px-2 py-1 rounded-md border border-gray-500/20">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">Profile Not Set</span>
                  </div>
                  <div className="pt-3 border-t border-[#3a3a3a] mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {testimonials.length}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        Testimonials
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Testimonials Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {testimonials.length > 0 ? (
                testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-[#1f1f1f] rounded-xl p-6 border border-[#3a3a3a] hover:border-indigo-500/50 transition-all duration-200 fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                              <User size={20} className="text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1f1f1f]">
                              <Shield size={10} className="text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg mb-1">
                              {testimonial.giverName || "Anonymous User"}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-mono text-gray-400 bg-[#2a2a2a] px-2 py-1 rounded-md">
                                {truncateAddress(testimonial.fromAddress)}
                              </span>
                              {testimonial.profileUrl && (
                                <a
                                  href={testimonial.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                                    getDomainInfo(testimonial.profileUrl)
                                      .bgClass
                                  }`}
                                >
                                  <ExternalLink size={11} />
                                  {getDomainInfo(testimonial.profileUrl).name}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-300">
                            {new Date(
                              testimonial.timestamp * 1000
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              testimonial.timestamp * 1000
                            ).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-indigo-500">
                          <p className="text-gray-200 leading-relaxed text-lg">
                            &ldquo;{testimonial.content}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#3a3a3a]">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Shield size={14} className="text-green-400" />
                          <span>Verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>
                            {new Date(
                              testimonial.timestamp * 1000
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#2a2a2a] rounded-2xl p-12 text-center border border-gray-800">
                  <div className="max-w-md mx-auto">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <User className="w-10 h-10 text-gray-300" />
                    </div>

                    {/* Heading */}
                    <h3 className="text-xl font-bold text-white mb-3">
                      No Testimonials Yet
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 leading-relaxed mb-6">
                      This user hasn&apos;t received any testimonials yet. Be
                      the first to share your experience working with them.
                    </p>

                    {/* Action suggestion */}
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        <span className="font-medium text-indigo-400">
                          Tip:
                        </span>{" "}
                        Testimonials help build trust and showcase expertise
                        within the community.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
