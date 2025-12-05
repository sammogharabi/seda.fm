#!/bin/bash

# sedā Deployment Script
# This script helps deploy the backend to Railway and frontend to Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          sedā Deployment Script               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$MONOREPO_DIR/backend"
FRONTEND_DIR="$MONOREPO_DIR/frontend-v2"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    if ! command -v railway &> /dev/null; then
        echo -e "${RED}Railway CLI not found. Install with: npm i -g @railway/cli${NC}"
        exit 1
    fi

    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}Vercel CLI not found. Install with: npm i -g vercel${NC}"
        exit 1
    fi

    echo -e "${GREEN}All prerequisites met!${NC}"
}

# Deploy backend to Railway
deploy_backend() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}       Deploying Backend to Railway             ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

    cd "$BACKEND_DIR"

    # Check if logged in
    if ! railway whoami &> /dev/null; then
        echo -e "${YELLOW}Please log in to Railway...${NC}"
        railway login
    fi

    # Check if project is linked
    if ! railway status &> /dev/null; then
        echo -e "${YELLOW}No Railway project linked. Creating new project...${NC}"
        railway init
    fi

    # Deploy
    echo -e "${YELLOW}Deploying backend...${NC}"
    railway up --detach

    # Get the URL
    echo ""
    echo -e "${GREEN}Backend deployed! Getting URL...${NC}"
    railway domain

    echo ""
    echo -e "${YELLOW}Don't forget to set these environment variables in Railway:${NC}"
    echo "  - NODE_ENV=production"
    echo "  - DATABASE_URL (from Supabase)"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - SENDGRID_API_KEY (optional, for emails)"
    echo "  - FRONTEND_URL (your Vercel URL)"
    echo "  - STRIPE_SECRET_KEY (for payments)"
    echo "  - STRIPE_WEBHOOK_SECRET"
    echo "  - PAYPAL_CLIENT_ID (optional)"
    echo "  - PAYPAL_CLIENT_SECRET (optional)"
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}       Deploying Frontend to Vercel             ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

    cd "$FRONTEND_DIR"

    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        echo -e "${YELLOW}Please log in to Vercel...${NC}"
        vercel login
    fi

    # Deploy to production
    echo -e "${YELLOW}Deploying frontend to production...${NC}"
    vercel --prod

    echo ""
    echo -e "${YELLOW}Don't forget to set these environment variables in Vercel:${NC}"
    echo "  - VITE_ENABLE_AUTH=true"
    echo "  - VITE_API_BASE_URL (your Railway backend URL + /api/v1)"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
}

# Main menu
main() {
    check_prerequisites

    echo ""
    echo -e "${YELLOW}What would you like to deploy?${NC}"
    echo "  1) Backend only (Railway)"
    echo "  2) Frontend only (Vercel)"
    echo "  3) Both (Backend first, then Frontend)"
    echo "  4) Exit"
    echo ""
    read -p "Choose an option (1-4): " choice

    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            deploy_frontend
            ;;
        4)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}       Deployment Complete!                    ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
}

main
