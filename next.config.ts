import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client', 'ccxt', 'ml-random-forest', 'ml-matrix', 'simple-statistics'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@tensorflow/tfjs-node')
    }
    return config
  },
};

export default nextConfig;
