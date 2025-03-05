"use client";
import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";

interface Testimonial {
  content: string;
  fromAddress: string;
  timestamp: number;
}

function Dashboard() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      content:
        "VouchMe has transformed how we collect and verify testimonials. Highly recommended!",
      fromAddress: "0x1234...5678",
      timestamp: Date.now(),
    },
    {
      content:
        "The blockchain verification feature gives our testimonials real credibility. Great platform!",
      fromAddress: "0x9abc...def0",
      timestamp: Date.now() - 86400000,
    },
  ]);
  const [newTestimonial, setNewTestimonial] = useState("");
  const [copied, setCopied] = useState(false);

  const shareableLink = "vouch.me/[your-address]";

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.trim()) return;

    // In a real app, this would interact with the blockchain
    const testimonial: Testimonial = {
      content: newTestimonial,
      fromAddress: "0x" + Math.random().toString(16).slice(2, 10),
      timestamp: Date.now(),
    };

    setTestimonials([testimonial, ...testimonials]);
    setNewTestimonial("");
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
              <div className="flex-1 bg-[#3a3a3a] rounded-lg px-4 py-3 font-mono text-sm">
                {shareableLink}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add to Blockchain
            </button>
          </form>
        </div>

        {/* Testimonials Section */}
        <h2 className="text-3xl font-bold mb-6">My Testimonials</h2>
        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#2d2d2d] transition-colors"
            >
              <p className="text-lg mb-6">{testimonial.content}</p>
              <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                    <span className="font-mono text-xs">
                      {testimonial.fromAddress.slice(0, 6)}
                    </span>
                  </div>
                  <span className="font-mono">{testimonial.fromAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Blockchain Verified
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
