import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Use relative paths so it works on both custom domain and GitHub Pages subpath
  basePath: "",
  assetPrefix: "./",
};


export default nextConfig;
