import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@chinta/shared"],
  turbopack: {
    root: resolve(configDir, "../.."),
  },
};

export default nextConfig;
