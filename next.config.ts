import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    API_URL: process.env.API_URL,
    SITE_URL: process.env.SITE_URL,
    HOME_SITE_URL: process.env.HOME_SITE_URL,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.cloudflarestorage.com' },
    ],
  },
};

export default nextConfig;
