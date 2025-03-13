"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const path = window.location.pathname;
    const hash = encodeURIComponent(path);
    if (path.startsWith("/testimonials/")) {
      window.location.replace("/testimonials.html#" + hash);
    } else if (path.startsWith("/write/")) {
      window.location.replace("/write.html#" + hash);
    } else {
      window.location.replace("/index.html#" + hash);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-8 text-center">
      <h1 className="text-3xl font-bold">Redirecting...</h1>
    </div>
  );
}
