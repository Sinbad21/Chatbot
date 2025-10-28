/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@chatbot-studio/database'],
  output: 'export', // Static HTML export for Cloudflare Pages
  images: {
    unoptimized: true, // Required for static export
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
