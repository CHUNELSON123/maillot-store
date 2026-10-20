
import type { NextConfig } from "next";

const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/v1",
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.slice(0, -1) as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/products/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/v1/uploads/products/**",
      },
    ],
  },
};

export default nextConfig;
