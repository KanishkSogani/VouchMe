"use client";
import { useRef, useCallback } from "react";
import toast from "react-hot-toast";

//  Ensures that a new toast won't appear if one is already active

export function useToast() {
  // Use a ref to track whether a toast is currently active
  const isToastActiveRef = useRef(false);

  const showSuccess = useCallback((message: string) => {
    if (isToastActiveRef.current) return;

    isToastActiveRef.current = true;
    toast.success(message, { duration: 2000 });

    setTimeout(() => {
      isToastActiveRef.current = false;
    }, 2000);
  }, []);

  const showError = useCallback((message: string) => {
    if (isToastActiveRef.current) return;

    isToastActiveRef.current = true;
    toast.error(message, { duration: 2000 });

    setTimeout(() => {
      isToastActiveRef.current = false;
    }, 2000);
  }, []);

  return { showSuccess, showError };
}
