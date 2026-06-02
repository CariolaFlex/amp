import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress cmdk script-tag warning (React 19 compat issue — cosmetic only, no prod impact)
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;
