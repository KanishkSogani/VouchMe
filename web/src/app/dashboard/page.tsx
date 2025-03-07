"use client";
import { useState, useEffect } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CONTRACT_ABI } from "@/utils/contract";

const CONTRACT_ADDRESS = "0x51a11e08643c9df6ceb5f7fb41a72334cfa7d1d6";

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

function Dashboard() {
  const { address } = useAccount();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [newTestimonial, setNewTestimonial] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const shareableLink = `localhost:3000/write/${address}`;

  // Fetch testimonials using ethers.js
  useEffect(() => {
    const fetchTestimonials = async () => {
      if (!address) return;

      try {
        const ethereum = (window as any).ethereum;
        if (!ethereum) return;

        const provider = new ethers.BrowserProvider(ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );

        // Get testimonial IDs
        const testimonialIds = await contract.getReceivedTestimonials(address);

        if (!testimonialIds || testimonialIds.length === 0) {
          setTestimonials([]);
          return;
        }

        // Get testimonial details for each ID
        const details = await Promise.all(
          testimonialIds.map((id) => contract.getTestimonialDetails(id))
        );

        const formattedTestimonials = details.map((detail: any) => ({
          content: detail.content,
          fromAddress: detail.sender,
          timestamp: Number(detail.timestamp),
          verified: detail.verified,
        }));

        setTestimonials(formattedTestimonials);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchTestimonials();
  }, [address]);

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.trim() || !address) return;

    try {
      setIsLoading(true);
      const signedData: SignedTestimonial = JSON.parse(newTestimonial);
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        console.error("No Ethereum provider found");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      // Call the contract method directly
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

        const formattedTestimonials = details.map((detail: any) => ({
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

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

        {/* Top Row - Stats and Collection Link */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {/* Stats Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Total Testimonials</h2>
              <div className="text-4xl font-bold">{testimonials.length}</div>
            </div>
            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-white" />
            </div>
          </div>

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
        </div>

        {/* Testimonials Section */}
        <h2 className="text-3xl font-bold mb-6">My Testimonials</h2>
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
            <div className="bg-[#2a2a2a] rounded-xl p-8 text-center">
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

export default Dashboard;
