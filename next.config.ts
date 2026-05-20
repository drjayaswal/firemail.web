import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    incomingRequests: false,
  },
  images: {
    qualities: [70, 75, 90],
  },
};

export default nextConfig;