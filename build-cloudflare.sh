#!/bin/bash
set -e

echo "🚀 Starting Cloudflare Pages build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Navigate to web app
cd apps/web
npm install

# Run Cloudflare build
echo "🏗️  Building Next.js app for Cloudflare..."
npx @cloudflare/next-on-pages

# Copy output to expected directory
echo "📁 Copying output to out/ directory..."
rm -rf out
cp -r .vercel/output/static out

echo "✅ Build completed successfully!"
echo "📂 Output directory: apps/web/out"
