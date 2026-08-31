import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "172.20.10.2",
        port: "3001",
        pathname: "/uploads/products/**",
      },
      {
        protocol: "http",
        hostname: "172.20.10.2",
        port: "3001",
        pathname: "/v1/uploads/products/**",
      },
    ],
  },
};

export default nextConfig;