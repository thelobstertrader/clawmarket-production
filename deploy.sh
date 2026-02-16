#!/bin/bash

# ClawMarket Deployment Script
# Usage: ./deploy.sh [backend|frontend|all]

set -e

echo "🦀 ClawMarket Deployment Script"
echo "================================"
echo ""

DEPLOY_TARGET=${1:-all}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Must run from project root!"
    exit 1
fi

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    print_warning "Git working directory is not clean!"
    echo "Uncommitted changes found:"
    git status -s
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Deploy Backend
deploy_backend() {
    echo ""
    echo "🚀 Deploying Backend..."
    echo "----------------------"

    # Test build
    print_warning "Testing backend build..."
    npm run build:backend

    if [ $? -eq 0 ]; then
        print_success "Backend build successful"
    else
        print_error "Backend build failed!"
        exit 1
    fi

    # Commit and push
    print_warning "Pushing to GitHub..."
    git add .
    git commit -m "Deploy backend - $(date +%Y-%m-%d_%H:%M)" || true
    git push origin main

    print_success "Backend pushed to GitHub"
    print_warning "Railway/Render will auto-deploy from GitHub"
    print_warning "Check your Railway/Render dashboard for progress"

    echo ""
    echo "Backend deployment initiated!"
    echo "URL: Check your Railway/Render dashboard"
}

# Deploy Frontend
deploy_frontend() {
    echo ""
    echo "🚀 Deploying Frontend..."
    echo "------------------------"

    # Test build
    print_warning "Testing frontend build..."
    npm run build:frontend

    if [ $? -eq 0 ]; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed!"
        exit 1
    fi

    # Commit and push
    print_warning "Pushing to GitHub..."
    git add .
    git commit -m "Deploy frontend - $(date +%Y-%m-%d_%H:%M)" || true
    git push origin main

    print_success "Frontend pushed to GitHub"
    print_warning "Cloudflare Pages will auto-deploy from GitHub"

    echo ""
    echo "Frontend deployment initiated!"
    echo "Check: https://dash.cloudflare.com → Pages"
}

# Main deployment logic
case $DEPLOY_TARGET in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        print_error "Invalid target: $DEPLOY_TARGET"
        echo "Usage: ./deploy.sh [backend|frontend|all]"
        exit 1
        ;;
esac

echo ""
echo "================================"
print_success "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Check Railway/Render for backend deployment"
echo "2. Check Cloudflare Pages for frontend deployment"
echo "3. Test: https://clawmarket.trade"
echo "4. Test API: https://api.clawmarket.trade/api/health"
echo ""
echo "🦀 Happy scuttling!"
