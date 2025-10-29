/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@chatbot-studio/database'],
  // Using @cloudflare/next-on-pages for Cloudflare Pages deployment
  // This allows SSR, API routes, and dynamic routes [id]
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
