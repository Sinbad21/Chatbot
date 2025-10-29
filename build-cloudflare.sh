#!/bin/bash
set -e

echo "🚀 Starting Cloudflare Pages build with OpenNext..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Navigate to web app
cd apps/web
npm install

# Run Next.js build
echo "🏗️  Building Next.js app..."
npm run build

# Run OpenNext Cloudflare adapter
echo "🔧 Running OpenNext Cloudflare adapter..."
npx opennextjs-cloudflare

# Copy output to expected directory
echo "📁 Copying output to out/ directory..."
rm -rf out
cp -r .open-next out

echo "✅ Build completed successfully!"
echo "📂 Output directory: apps/web/out"
