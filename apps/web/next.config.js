/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Cloudflare Pages
  reactStrictMode: true,
  transpilePackages: ['@chatbot-studio/database'],
  images: {
    unoptimized: true,
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
  // Allow dynamic routes to be exported as client-side only
  trailingSlash: true,
};

module.exports = nextConfig;
