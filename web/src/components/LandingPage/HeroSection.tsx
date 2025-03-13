"use client";

import { useRouter } from "next/navigation";
import { Highlight } from "../ui/hero-highlight";
import { useAccount } from "wagmi";

const HeroSection = () => {
  const router = useRouter();
  const { address } = useAccount();

  return (
    <div className="h-auto pt-20 pb-20 md:pb-48 bg-[#171717] flex flex-col items-center justify-center text-center px-4 py-16">
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 max-w-3xl !leading-tight">
        Build Trust Through Verified{" "}
        <Highlight className="text-black">Testimonials</Highlight>
      </h1>

      <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl">
        Collect, secure, and showcase authentic testimonials to enhance
        reputation and accelerate growth.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-bold"
        >
          Start Collecting Testimonials
        </button>

        <button
          onClick={() =>
            address
              ? router.push(`/testimonials?address=${address}`)
              : alert("Please connect your wallet to view your showcase.")
          }
          disabled={!address}
          className={`px-8 py-3 bg-transparent text-white border border-gray-600 rounded-lg font-medium transition-colors ${
            address ? "hover:bg-gray-800" : "opacity-50 cursor-not-allowed"
          }`}
        >
          View Showcase
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
