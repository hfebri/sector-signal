import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_REPLICATE_API_TOKEN: process.env.NEXT_REPLICATE_API_TOKEN,
    NEXT_RIVALIQ_API_KEY: process.env.NEXT_RIVALIQ_API_KEY,
  },
  // Fix for postgres library with Next.js 15
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
