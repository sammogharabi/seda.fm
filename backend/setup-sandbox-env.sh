#!/bin/bash

# Sandbox Environment Setup for sedā.fm Edge Functions
# This script configures environment variables for the sandbox Supabase project

set -e

echo "🧪 Setting up Sandbox Environment Variables for sedā.fm"
echo "Project: seda-sbx (ubfgyrgyxqccybqpcgxq)"
echo

# Generate secure admin secret
ADMIN_SECRET=$(openssl rand -hex 32)
echo "Generated secure admin secret: $ADMIN_SECRET"
echo

# Set environment variables for sandbox
echo "Setting environment variables..."

# Environment configuration
supabase secrets set ENV_TAG=sandbox --project-ref ubfgyrgyxqccybqpcgxq
supabase secrets set NODE_ENV=sandbox --project-ref ubfgyrgyxqccybqpcgxq

# Admin secret
supabase secrets set ADMIN_SECRET="$ADMIN_SECRET" --project-ref ubfgyrgyxqccybqpcgxq

# PostHog API key (using existing key)
supabase secrets set POSTHOG_API_KEY="phc_7RiYNu4koj0vuqSkBr4LF7ZFelzvToKyJ0KmVqjUBfo" --project-ref ubfgyrgyxqccybqpcgxq

echo
echo "✅ Sandbox environment variables configured!"
echo "📝 Save this admin secret securely: $ADMIN_SECRET"
echo
echo "🌐 Sandbox URLs:"
echo "  • Health: https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/health"
echo "  • Metrics: https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/metrics"
echo "  • Flags: https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/flags"
echo "  • Dev: https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/*"
echo
echo "🔐 Use this admin secret in the x-admin-secret header:"
echo "  curl -H \"x-admin-secret: $ADMIN_SECRET\" [URL]"