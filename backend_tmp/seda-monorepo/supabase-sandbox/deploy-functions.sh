#!/bin/bash

# SEDA Edge Functions Deployment Script
# Run this script to deploy all edge functions to your Supabase sandbox project

set -e

echo "🚀 Deploying SEDA Edge Functions to Sandbox"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Must run from supabase project directory"
    echo "   cd /Users/sammogharabi/Documents/Projects/Seda/supabase-sandbox"
    exit 1
fi

# Check if linked to project
echo "📡 Checking Supabase connection..."
if ! supabase status > /dev/null 2>&1; then
    echo "🔗 Linking to Supabase project..."
    supabase link --project-ref mqmbjtmibiaukiyiumhl
fi

echo "📦 Deploying edge functions..."

# Deploy all functions
echo "  ➤ Deploying /flags..."
supabase functions deploy flags

echo "  ➤ Deploying /health..."
supabase functions deploy health

echo "  ➤ Deploying /metrics..."
supabase functions deploy metrics

echo "  ➤ Deploying /dev..."
supabase functions deploy dev

echo ""
echo "✅ All edge functions deployed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables in Supabase dashboard:"
echo "   https://supabase.com/dashboard/project/mqmbjtmibiaukiyiumhl/settings/edge-functions"
echo ""
echo "2. Add these secrets:"
echo "   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo "   - ADMIN_SECRET=choose_secure_admin_password"
echo "   - POSTHOG_API_KEY=optional_analytics_key"
echo ""
echo "3. Test the functions:"
echo "   curl https://mqmbjtmibiaukiyiumhl.supabase.co/functions/v1/health"
echo "   curl https://mqmbjtmibiaukiyiumhl.supabase.co/functions/v1/flags"
echo ""
echo "🎉 Edge functions are ready!"