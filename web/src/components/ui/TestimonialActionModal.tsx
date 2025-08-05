"use client";

import { Button } from "./button";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface TestimonialActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "reject"; // Only reject now
  giverName: string;
  isLoading?: boolean;
}

export function TestimonialActionModal({
  isOpen,
  onClose,
  onConfirm,
  giverName,
  isLoading = false,
}: TestimonialActionModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#2a2a2a] rounded-2xl border border-[#3a3a3a] shadow-2xl p-6 mx-4 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <X className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Reject Testimonial
            </h2>
            <p className="text-sm text-gray-400">
              From{" "}
              <span className="text-gray-300 font-medium">{giverName}</span>
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-200">
            <p className="font-medium mb-2 text-amber-100">
              This action cannot be undone
            </p>
            <p className="text-amber-200/90 leading-relaxed">
              Rejecting this testimonial will permanently remove it from the
              Waku network. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-transparent border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] hover:text-white transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-24 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              "Reject"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
