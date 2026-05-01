import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Custom domain (chatquota.com) — use absolute paths so /chat/ page resolves _next correctly
  basePath: "",
  assetPrefix: "/",
};


export default nextConfig;
