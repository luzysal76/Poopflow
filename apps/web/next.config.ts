import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? "/Poopflow" : "",
  assetPrefix: isProd ? "/Poopflow/" : "",
};

export default nextConfig;
