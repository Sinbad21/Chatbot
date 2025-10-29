#!/bin/bash
set -e

echo "🚀 Starting Cloudflare Pages build with OpenNext..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Navigate to web app
cd apps/web
npm install

# Run OpenNext build for Cloudflare
echo "🏗️  Building Next.js app with OpenNext..."
npx open-next@latest build --platform cloudflare

# Copy output to expected directory
echo "📁 Copying output to out/ directory..."
rm -rf out
cp -r .open-next/cloudflare out

echo "✅ Build completed successfully!"
echo "📂 Output directory: apps/web/out"
