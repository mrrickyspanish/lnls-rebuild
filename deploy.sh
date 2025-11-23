#!/bin/bash

# LNLS Platform - Vercel Production Deployment Script
# This script ensures you're on main with the latest code before deploying to Vercel

set -e  # Exit on any error

echo "🚀 Starting LNLS Platform deployment to Vercel..."
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
