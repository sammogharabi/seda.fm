#!/bin/bash

# Production Environment Setup for sedā.fm Edge Functions
# This script configures environment variables for the production Supabase project

set -e

echo "🚀 Setting up Production Environment Variables for sedā.fm"
echo "Project: seda-prod (ifrbbfqabeeyxrrliank)"
echo

# Generate secure admin secret
ADMIN_SECRET=$(openssl rand -hex 32)
echo "Generated secure admin secret: $ADMIN_SECRET"
echo

# Set environment variables for production
echo "Setting environment variables..."

# Environment configuration
supabase secrets set ENV_TAG=production --project-ref ifrbbfqabeeyxrrliank
supabase secrets set NODE_ENV=production --project-ref ifrbbfqabeeyxrrliank

# Admin secret
supabase secrets set ADMIN_SECRET="$ADMIN_SECRET" --project-ref ifrbbfqabeeyxrrliank

# PostHog API key (using existing key)
supabase secrets set POSTHOG_API_KEY="phc_7RiYNu4koj0vuqSkBr4LF7ZFelzvToKyJ0KmVqjUBfo" --project-ref ifrbbfqabeeyxrrliank

echo
echo "✅ Production environment variables configured!"
echo "📝 Save this admin secret securely: $ADMIN_SECRET"
echo
echo "🌐 Production URLs:"
echo "  • Health: https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health"
echo "  • Metrics: https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/metrics"
echo "  • Flags: https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/flags"
echo "  • Dev endpoints: DISABLED (production)"
echo
echo "🔐 Use this admin secret in the x-admin-secret header:"
echo "  curl -H \"x-admin-secret: $ADMIN_SECRET\" [URL]"