#!/bin/bash

echo "🚂 Railway Deployment Script for SEDA Platform"
echo "============================================="
echo ""
echo "This script will guide you through deploying to Railway."
echo ""

# Step 1: Login
echo "Step 1: Login to Railway"
echo "A browser window will open for authentication..."
railway login

# Step 2: Initialize project
echo ""
echo "Step 2: Initialize Railway project"
railway init

# Step 3: Link to GitHub (optional)
echo ""
echo "Step 3: Link to GitHub repository (optional)"
echo "You can skip this by pressing Enter if you want to deploy from local"
railway link

# Step 4: Set environment variables
echo ""
echo "Step 4: Setting environment variables..."
echo "You'll need to add your Supabase keys manually in Railway dashboard"
echo "For now, setting basic variables..."

# Set basic environment variables
railway env set NODE_ENV=production
railway env set PORT=3001
railway env set API_PREFIX=api/v1

# Supabase URLs (you'll need to add keys manually)
railway env set SUPABASE_URL=https://ifrbbfqabeeyxrrliank.supabase.co

# Admin key from Edge Functions
railway env set ADMIN_API_KEY=aa4f80999796fe8b5e05c0b5732139c4a4f21d6e3d23e4d24646f98267d33b86

echo ""
echo "⚠️  IMPORTANT: You need to add these sensitive keys in Railway dashboard:"
echo "  - SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_KEY"
echo "  - DATABASE_URL"
echo "  - JWT_SECRET"
echo ""
echo "Go to: https://railway.app/project/[your-project-id]/settings/variables"
echo ""

# Step 5: Deploy
echo "Step 5: Deploying to Railway..."
railway up

# Get deployment URL
echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "Getting your deployment URL..."
railway status

echo ""
echo "============================================="
echo "✅ Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Add missing environment variables in Railway dashboard"
echo "2. Wait for build to complete (check Railway dashboard)"
echo "3. Your app will be available at the provided URL"
echo "4. Test using UAT_CHECKLIST.md"
echo ""