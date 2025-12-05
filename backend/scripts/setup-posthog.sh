#!/bin/bash

# PostHog Setup Script for sedā.fm
# This script helps you safely configure PostHog API keys

echo "🔐 PostHog Configuration Setup for sedā.fm"
echo "=========================================="
echo ""
echo "⚠️  SECURITY NOTICE:"
echo "If you've shared your API key publicly, please:"
echo "1. Go to https://app.posthog.com/project/settings"
echo "2. Revoke the exposed key"
echo "3. Generate a new API key"
echo ""
echo "Press Enter to continue..."
read

# Function to validate API key format
validate_api_key() {
    if [[ $1 =~ ^phc_[a-zA-Z0-9]{40,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Get new API key
echo "Please enter your NEW PostHog API key (starts with 'phc_'):"
read -s POSTHOG_KEY
echo ""

# Validate the key
if ! validate_api_key "$POSTHOG_KEY"; then
    echo "❌ Invalid API key format. PostHog keys start with 'phc_'"
    exit 1
fi

# Create local environment file
echo "Setting up local development environment..."
cat > supabase/.env.local << EOF
# Local Development Environment
ENV_TAG=development
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}

# Admin Secret
ADMIN_SECRET=local_dev_$(openssl rand -hex 16)

# PostHog Analytics
POSTHOG_API_KEY=$POSTHOG_KEY

# Database URL
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
EOF

echo "✅ Local environment file created: supabase/.env.local"
echo ""

# Instructions for Supabase Dashboard
echo "📋 Next Steps:"
echo ""
echo "1. For PRODUCTION (Supabase Dashboard):"
echo "   - Go to your production project settings"
echo "   - Add these environment variables:"
echo "     ENV_TAG=production"
echo "     ADMIN_SECRET=$(openssl rand -hex 32)"
echo "     POSTHOG_API_KEY=$POSTHOG_KEY"
echo ""
echo "2. For SANDBOX (Supabase Dashboard):"
echo "   - Go to your sandbox project settings"
echo "   - Add these environment variables:"
echo "     ENV_TAG=sandbox"
echo "     ADMIN_SECRET=$(openssl rand -hex 32)"
echo "     POSTHOG_API_KEY=$POSTHOG_KEY"
echo ""
echo "3. For LOCAL QA:"
echo "   - Your .env.local is ready!"
echo "   - Start with: supabase start && supabase functions serve"
echo ""
echo "4. Test your setup:"
echo "   curl http://localhost:54321/functions/v1/dev/posthog-status"
echo ""
echo "🔒 Security Reminders:"
echo "- Never commit .env files to git"
echo "- Use different admin secrets for each environment"
echo "- Rotate API keys periodically"
echo "- Monitor PostHog usage for unexpected activity"