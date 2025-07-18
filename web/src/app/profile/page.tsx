"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { ethers } from "ethers";
import { User, Mail, FileText, Save, Edit3 } from "lucide-react";
import { CONTRACT_ADDRESSES, VouchMeFactory } from "@/utils/contract";
import { useToast } from "@/hooks/useToast";

interface Profile {
  name: string;
  contact: string;
  bio: string;
}

export default function ProfilePage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { showSuccess, showError } = useToast();

  const [profile, setProfile] = useState<Profile>({
    name: "",
    contact: "",
    bio: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tempProfile, setTempProfile] = useState<Profile>({
    name: "",
    contact: "",
    bio: "",
  });

  const CONTRACT_ADDRESS =
    CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[534351];

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = VouchMeFactory.connect(CONTRACT_ADDRESS, provider);

      const userProfile = await contract.userProfiles(address);

      setProfile({
        name: userProfile.name,
        contact: userProfile.contact,
        bio: userProfile.bio,
      });
      setTempProfile({
        name: userProfile.name,
        contact: userProfile.contact,
        bio: userProfile.bio,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      showError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [address, CONTRACT_ADDRESS, showError]);

  // Save profile to blockchain
  const saveProfile = async () => {
    if (!address) return;

    try {
      setIsSaving(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = VouchMeFactory.connect(CONTRACT_ADDRESS, signer);

      const tx = await contract.setProfile(
        tempProfile.name,
        tempProfile.contact,
        tempProfile.bio
      );

      await tx.wait();

      setProfile({ ...tempProfile });
      setIsEditing(false);
      showSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      showError("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setIsEditing(false);
  };

  const handleSave = () => {
    saveProfile();
  };

  useEffect(() => {
    if (address) {
      fetchProfile();
    }
  }, [address, chainId, fetchProfile]);

  if (!address) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400">
                Please connect your wallet to view and edit your profile
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-400">
            Manage your public profile information on VouchMe
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-[#2a2a2a] px-6 py-6 border-b border-[#3a3a3a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {profile.name || "Anonymous User"}
                  </h2>
                  <div className="font-mono text-sm text-gray-400 bg-[#3a3a3a] px-3 py-1 rounded-lg inline-block">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.name}
                      onChange={(e) =>
                        setTempProfile({ ...tempProfile, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="w-full bg-[#3a3a3a] rounded-lg p-4 text-white border border-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-gray-500"
                    />
                  ) : (
                    <div className="bg-[#3a3a3a] rounded-lg p-4 min-h-[56px] flex items-center">
                      {profile.name || (
                        <span className="text-gray-500 italic">
                          Add your name to personalize your profile
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <Mail className="w-4 h-4" />
                    Contact Information
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.contact}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          contact: e.target.value,
                        })
                      }
                      placeholder="Email, LinkedIn, or other contact info"
                      className="w-full bg-[#3a3a3a] rounded-lg p-4 text-white border border-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-gray-500"
                    />
                  ) : (
                    <div className="bg-[#3a3a3a] rounded-lg p-4 min-h-[56px] flex items-center">
                      {profile.contact || (
                        <span className="text-gray-500 italic">
                          Share your email or social links
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bio Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <FileText className="w-4 h-4" />
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempProfile.bio}
                      onChange={(e) =>
                        setTempProfile({ ...tempProfile, bio: e.target.value })
                      }
                      placeholder="Tell people about yourself, your profession, interests..."
                      rows={4}
                      className="w-full bg-[#3a3a3a] rounded-lg p-4 text-white border border-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-gray-500 resize-none"
                    />
                  ) : (
                    <div className="bg-[#3a3a3a] rounded-lg p-4 min-h-[120px] flex items-start">
                      {profile.bio ? (
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {profile.bio}
                        </p>
                      ) : (
                        <span className="text-gray-500 italic">
                          Tell others about yourself, your work, and interests
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3a3a3a]">
                    <button
                      onClick={handleCancel}
                      className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors disabled:bg-indigo-400 font-medium flex items-center gap-2"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Tips */}
        <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Profile Tips
          </h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Your profile helps others understand who you are when giving or
                receiving testimonials
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Include professional contact information to increase credibility
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>A good bio helps contextualize the testimonials you receive</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
