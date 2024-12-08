/** @type {import('next').NextConfig} */
const nextConfig = {
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
