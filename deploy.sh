#!/bin/bash

# LNLS Platform - Vercel Production Deployment Script
# This script ensures you're on main with the latest code before deploying to Vercel

set -e  # Exit on any error

echo "🚀 Starting LNLS Platform deployment to Vercel..."
echo ""

# Pre-flight checks
echo "🔍 Running pre-flight checks..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI is not installed."
    echo "   Install it with: npm install -g vercel"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: You have uncommitted changes."
    echo "   Please commit or stash your changes before deploying."
    exit 1
fi

echo "✅ Pre-flight checks passed"
echo ""

# Step 1: Make sure you're on main and have the latest code
echo "📋 Step 1: Checking out main branch and pulling latest code..."
git checkout main
git pull origin main
echo "✅ On main branch with latest code"
echo ""

# Step 2: Install any new dependencies
echo "📦 Step 2: Installing dependencies..."
npm ci
echo "✅ Dependencies installed"
echo ""

# Step 3: Build & push to Vercel production
echo "🌐 Step 3: Deploying to Vercel production..."
vercel --prod
echo "✅ Deployed to Vercel production"
echo ""

echo "🎉 Deployment complete!"
