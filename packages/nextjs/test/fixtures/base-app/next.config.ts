import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = [
        '@midwayjs/core',
        '@midwayjs/core/functional',
      ];

      config.externals = [
        ...externals,
        ...(Array.isArray(config.externals) ? config.externals : []),
      ];
    }
    return config;
  },
};

export default nextConfig;
