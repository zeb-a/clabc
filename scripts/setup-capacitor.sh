#!/bin/bash

# Capacitor Android Setup Script for ClassABC
# This script initializes and sets up Capacitor for Android builds

set -e

echo "=========================================="
echo "  Capacitor Android Setup for ClassABC"
echo "=========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
else
    echo "✅ dist folder exists"
fi

# Initialize Capacitor if not already done
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ capacitor.config.ts not found!"
    exit 1
fi

echo ""
echo "📱 Syncing with Android platform..."
npx cap sync android

echo ""
echo "✅ Capacitor Android setup complete!"
echo ""
echo "To open in Android Studio, run:"
echo "  npm run cap:open:android"
echo ""
echo "To build APK directly, run:"
echo "  npm run cap:build:android"
echo ""
