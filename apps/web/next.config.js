/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimized build for Cloudflare Pages
  reactStrictMode: true,
  transpilePackages: ['@chatbot-studio/database'],
  images: {
    unoptimized: true,
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
