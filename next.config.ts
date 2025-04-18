import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@dtelecom/components-react',
    '@dtelecom/livekit-client',
    '@dtelecom/components-styles'
  ],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
