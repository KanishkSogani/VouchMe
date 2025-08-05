// Simple polyfill to ensure crypto is available in browser
if (typeof window !== "undefined") {
  if (!window.crypto) {
    // Basic polyfill - this will be handled by webpack polyfills
    console.log("Crypto polyfill will be provided by webpack");
  }
}

export {};
