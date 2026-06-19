import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.EXPORT_STATIC === "true" ? { output: "export" } : {}),
};

export default nextConfig;
