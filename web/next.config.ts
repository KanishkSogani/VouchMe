import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,
  },
  webpack: (
    config: webpack.Configuration,
    { isServer }: { isServer: boolean }
  ) => {
    if (!isServer) {
      // Browser-specific polyfills
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        util: require.resolve("util"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
        url: require.resolve("url"),
        global: require.resolve("global/window"),
        process: require.resolve("process/browser"),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        "pino-pretty": false,
      };

      // Provide global variables
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
          global: "global/window",
        })
      );

      // Add alias for nodeCrypto
      config.resolve.alias = {
        ...config.resolve.alias,
        nodeCrypto: "crypto-browserify",
      };
    }
    return config;
  },
};

export default nextConfig;
