import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // three ecosystem publica add-ons sin transpilar -> Next debe transpilarlos
  transpilePackages: ["three"],
};

export default nextConfig;
