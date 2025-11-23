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
NC='\033[0m' # No Color

# Store the original branch/state for restoration
ORIGINAL_BRANCH=""
DETACHED_HEAD=false

# Trap function to restore original branch on exit
restore_branch() {
    local exit_code=$?
    if [[ "$DETACHED_HEAD" == "false" ]] && [[ -n "$ORIGINAL_BRANCH" ]] && [[ "$ORIGINAL_BRANCH" != "main" ]]; then
        echo ""
        echo "🔄 Restoring original branch: $ORIGINAL_BRANCH"
        if ! git checkout "$ORIGINAL_BRANCH" 2>/dev/null; then
            echo -e "${RED}⚠ Warning: Failed to restore original branch${NC}"
            echo "You may need to manually checkout: git checkout $ORIGINAL_BRANCH"
        fi
    fi
    if [[ $exit_code -ne 0 ]]; then
        echo -e "${RED}❌ Deployment failed${NC}"
    fi
    exit $exit_code
}

trap restore_branch EXIT

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
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo -e "${RED}✗ Error: Uncommitted changes detected${NC}"
    echo "Please commit or stash your changes before deploying:"
    git status -s
    exit 1
fi
echo -e "${GREEN}✓ No uncommitted changes${NC}"
echo ""

# Get current branch for reference (handle detached HEAD)
ORIGINAL_BRANCH=$(git branch --show-current)
if [[ -z "$ORIGINAL_BRANCH" ]]; then
    DETACHED_HEAD=true
    echo "📍 Current state: Detached HEAD"
    echo -e "${RED}⚠ Warning: You are in detached HEAD state${NC}"
else
    echo "📍 Current branch: $ORIGINAL_BRANCH"
fi
echo ""

# Check if main branch exists
echo "🔍 Pre-flight Check: Main Branch"
if ! git show-ref --verify --quiet refs/heads/main; then
    echo -e "${RED}✗ Error: 'main' branch not found${NC}"
    echo "Please ensure the repository has a 'main' branch"
    exit 1
fi
echo -e "${GREEN}✓ Main branch exists${NC}"
echo ""

# Check if origin remote exists
echo "🔍 Pre-flight Check: Git Remote"
if ! git remote get-url origin &> /dev/null; then
    echo -e "${RED}✗ Error: 'origin' remote not found${NC}"
    echo "Please ensure the git remote 'origin' is configured"
    exit 1
fi
echo -e "${GREEN}✓ Git remote 'origin' configured${NC}"
echo ""

# Checkout main branch
echo "🔄 Switching to main branch..."
git checkout main
echo -e "${GREEN}✓ Switched to main branch${NC}"
echo ""

# Pull latest changes (fast-forward only)
echo "📥 Pulling latest changes..."
if ! git pull --ff-only origin main; then
    echo -e "${RED}✗ Error: Failed to pull changes${NC}"
    echo "Your local main branch has diverged from origin/main"
    echo "Please resolve this manually before deploying:"
    echo "  git fetch origin"
    echo "  git merge origin/main"
    echo "Or reset to match remote: git reset --hard origin/main"
    exit 1
fi
echo -e "${GREEN}✓ Latest changes pulled${NC}"
echo ""

# Clean install dependencies
echo "📦 Installing dependencies (clean install)..."
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Verify Vercel project context
echo "🔍 Verifying Vercel project..."
if [[ -f ".vercel/project.json" ]]; then
    # Verify the project.json contains valid project configuration
    if grep -q '"projectId"' ".vercel/project.json" 2>/dev/null; then
        echo -e "${GREEN}✓ Vercel project linked${NC}"
    else
        echo -e "${RED}⚠ Warning: Invalid Vercel project configuration${NC}"
        echo "Run 'vercel link' to reconnect this directory to a Vercel project"
    fi
else
    echo -e "${RED}⚠ Warning: Vercel project not linked${NC}"
    echo "Run 'vercel link' to connect this directory to a Vercel project"
    echo "The deployment will prompt you to select a project"
fi
echo ""

# Deploy to production
echo "🚢 Deploying to Vercel production..."
vercel --prod
echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""

echo "========================================"
echo "✨ Deployment successful!"
echo "========================================"
# Branch restoration will be handled by the trap function
