#!/bin/bash

# Secure Environment Setup for sedā.fm
# This script helps you configure API keys WITHOUT exposing them

set -e

echo "🔐 Secure Environment Configuration for sedā.fm"
echo "=============================================="
echo ""
echo "⚠️  SECURITY RULES:"
echo "1. NEVER share API keys in chat, email, or messages"
echo "2. NEVER commit API keys to git"
echo "3. ALWAYS revoke exposed keys immediately"
echo ""
echo "This script will help you set up your environment securely."
echo ""

# Check if PostHog key was passed as argument (for automation)
if [ -n "$1" ]; then
    echo "❌ ERROR: Do not pass API keys as command arguments!"
    echo "Run this script without arguments and enter the key when prompted."
    exit 1
fi

# Function to validate API key format
validate_posthog_key() {
    if [[ $1 =~ ^phc_[a-zA-Z0-9]{40,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to generate secure random string
generate_secret() {
    openssl rand -hex 32 2>/dev/null || cat /dev/urandom | head -c 32 | base64
}

echo "Step 1: PostHog API Key Setup"
echo "------------------------------"
echo "1. Go to https://app.posthog.com/project/settings"
echo "2. Generate a NEW API key (if you haven't already)"
echo "3. DO NOT paste it in any chat or message"
echo ""
echo "Ready? Press Enter to continue..."
read

echo ""
echo "Now, please type your PostHog API key (it will be hidden):"
echo "(Keys start with 'phc_' and are about 43 characters long)"
read -s POSTHOG_KEY
echo ""

# Validate the key
if [ -z "$POSTHOG_KEY" ]; then
    echo "⚠️  No key entered. You can add it manually later."
    POSTHOG_KEY="phc_YOUR_API_KEY_HERE"
elif ! validate_posthog_key "$POSTHOG_KEY"; then
    echo "⚠️  Warning: Key format looks incorrect (should start with 'phc_')"
    echo "Continuing anyway - you can update it later if needed."
fi

echo "✅ API key captured securely (not displayed)"
echo ""

# Generate admin secrets
echo "Step 2: Generating Admin Secrets"
echo "--------------------------------"
ADMIN_SECRET_LOCAL=$(generate_secret)
ADMIN_SECRET_SANDBOX=$(generate_secret)
ADMIN_SECRET_PROD=$(generate_secret)

echo "✅ Generated unique admin secrets for each environment"
echo ""

# Create local environment file
echo "Step 3: Creating Local Environment File"
echo "---------------------------------------"

mkdir -p supabase
cat > supabase/.env.local << EOF
# Local Development Environment - sedā.fm
# Generated on $(date)
# SECURITY: Never commit this file to git!

# Environment Configuration
ENV_TAG=development
NODE_ENV=development

# Supabase Configuration (update after running 'supabase start')
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key-from-supabase-start

# Admin Secret (auto-generated secure value)
ADMIN_SECRET=${ADMIN_SECRET_LOCAL}

# PostHog Analytics
POSTHOG_API_KEY=${POSTHOG_KEY}

# Database URL
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
EOF

echo "✅ Created: supabase/.env.local"
echo ""

# Create deployment instructions
cat > DEPLOYMENT_SECRETS.md << EOF
# Deployment Secrets for sedā.fm
Generated on $(date)

## ⚠️ SECURITY NOTICE
- This file contains sensitive information
- Delete this file after configuring your environments
- Never commit this file to git
- Never share these values in chat/email

## Production Environment (Supabase Dashboard)
\`\`\`
ENV_TAG=production
ADMIN_SECRET=${ADMIN_SECRET_PROD}
POSTHOG_API_KEY=${POSTHOG_KEY}
\`\`\`

## Sandbox Environment (Supabase Dashboard)
\`\`\`
ENV_TAG=sandbox
ADMIN_SECRET=${ADMIN_SECRET_SANDBOX}
POSTHOG_API_KEY=${POSTHOG_KEY}
\`\`\`

## Local QA Environment (Already configured in supabase/.env.local)
\`\`\`
ENV_TAG=development
ADMIN_SECRET=${ADMIN_SECRET_LOCAL}
POSTHOG_API_KEY=${POSTHOG_KEY}
\`\`\`

## Setup Instructions

### 1. Production Setup
1. Go to your Supabase Production project
2. Navigate to Settings → Edge Functions
3. Add the environment variables listed above
4. Deploy functions: \`supabase functions deploy --project-ref YOUR_PROD_REF\`

### 2. Sandbox Setup
1. Go to your Supabase Sandbox project
2. Navigate to Settings → Edge Functions
3. Add the environment variables listed above
4. Deploy functions: \`supabase functions deploy --project-ref YOUR_SANDBOX_REF\`

### 3. Local QA Setup
1. Start Supabase locally: \`supabase start\`
2. Update the SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in supabase/.env.local
3. Serve functions: \`supabase functions serve\`

## Testing Your Setup

### Test Local Environment
\`\`\`bash
curl http://localhost:54321/functions/v1/health
curl http://localhost:54321/functions/v1/dev/posthog-status
\`\`\`

### Test with Admin Secret
\`\`\`bash
curl -H "x-admin-secret: ${ADMIN_SECRET_LOCAL}" \\
     http://localhost:54321/functions/v1/metrics
\`\`\`

## ⚠️ DELETE THIS FILE AFTER SETUP
Once you've configured all environments, delete this file:
\`\`\`bash
rm DEPLOYMENT_SECRETS.md
\`\`\`
EOF

# Add to gitignore if not already there
if ! grep -q "DEPLOYMENT_SECRETS.md" .gitignore 2>/dev/null; then
    echo -e "\n# Deployment secrets - NEVER commit\nDEPLOYMENT_SECRETS.md" >> .gitignore
    echo "✅ Added DEPLOYMENT_SECRETS.md to .gitignore"
fi

echo ""
echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Check DEPLOYMENT_SECRETS.md for your environment configurations"
echo "   (This file has your secrets - keep it safe!)"
echo ""
echo "2. Configure your Supabase projects:"
echo "   - Copy the values from DEPLOYMENT_SECRETS.md"
echo "   - Add them to each Supabase project's environment variables"
echo ""
echo "3. Test your local setup:"
echo "   supabase start"
echo "   supabase functions serve"
echo "   curl http://localhost:54321/functions/v1/health"
echo ""
echo "4. DELETE the DEPLOYMENT_SECRETS.md file after setup:"
echo "   rm DEPLOYMENT_SECRETS.md"
echo ""
echo "🔒 Security Reminders:"
echo "- Your API key is stored securely in the environment files"
echo "- Each environment has a unique admin secret"
echo "- Never share or commit these values"
echo "- If you accidentally expose a key, revoke it immediately!"
echo ""
echo "Need to start over? Just run this script again."