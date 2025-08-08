// Simple crypto polyfill for Waku SDK in browser environment
/* eslint-disable @typescript-eslint/no-explicit-any */

// Add global polyfills if we're in a browser environment
if (typeof window !== "undefined") {
  // Set up global reference
  if (!(window as any).global) {
    (window as any).global = window;
  }

  // Set up process polyfill
  if (!(window as any).process) {
    (window as any).process = {
      env: { NODE_ENV: "production" },
      browser: true,
      version: "",
      versions: {
        node: "18.0.0",
        http_parser: "",
        v8: "",
        ares: "",
        uv: "",
        zlib: "",
        modules: "",
        openssl: "",
      },
      nextTick: (callback: () => void) => {
        setTimeout(callback, 0);
      },
    };
  }

  // Buffer polyfill
  if (!(window as any).Buffer) {
    import("buffer")
      .then((BufferModule) => {
        (window as any).Buffer = BufferModule.Buffer;
      })
      .catch(() => {
        console.warn("Buffer polyfill not available");
      });
  }
}

export {};
