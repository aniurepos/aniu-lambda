import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Build with empty basePath. After build, sed replaces /_next/ with ./_next/
  // so it works on both custom domain (/) and GitHub Pages subpath (/aniu-lambda)
  basePath: "",
  assetPrefix: "",
};


export default nextConfig;
