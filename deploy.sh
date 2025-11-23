#!/bin/bash

# LNLS Platform - Production Deployment Script
# Ensures clean deployments from main branch with latest dependencies

set -e  # Exit on any error

echo "🚀 LNLS Platform - Production Deployment"
echo "========================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pre-flight validation: Check for Vercel CLI
echo "🔍 Pre-flight Check: Vercel CLI"
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Error: Vercel CLI not found${NC}"
    echo "Please install Vercel CLI: npm install -g vercel"
    exit 1
fi
echo -e "${GREEN}✓ Vercel CLI found${NC}"
echo ""

# Pre-flight validation: Check for uncommitted changes
echo "🔍 Pre-flight Check: Uncommitted Changes"
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}✗ Error: Uncommitted changes detected${NC}"
    echo "Please commit or stash your changes before deploying:"
    git status -s
    exit 1
fi
echo -e "${GREEN}✓ No uncommitted changes${NC}"
echo ""

# Get current branch for reference
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Checkout main branch
echo "🔄 Switching to main branch..."
git checkout main
echo -e "${GREEN}✓ Switched to main branch${NC}"
echo ""

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull
echo -e "${GREEN}✓ Latest changes pulled${NC}"
echo ""

# Clean install dependencies
echo "📦 Installing dependencies (clean install)..."
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Deploy to production
echo "🚢 Deploying to Vercel production..."
vercel --prod
echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""

# Return to original branch if different from main
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "🔄 Returning to branch: $CURRENT_BRANCH"
    git checkout "$CURRENT_BRANCH"
fi

echo "========================================"
echo "✨ Deployment successful!"
echo "========================================"
