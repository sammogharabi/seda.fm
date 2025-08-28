#!/bin/bash

# Sedā.fm Edge Functions Deployment Script
# Usage: ./deploy.sh [environment] [function_name]
# Example: ./deploy.sh production flags

set -e

ENVIRONMENT=${1:-qa}
FUNCTION_NAME=${2:-all}

echo "🚀 Deploying Sedā.fm Edge Functions"
echo "Environment: $ENVIRONMENT"
echo "Function: $FUNCTION_NAME"

# Validate environment
case $ENVIRONMENT in
  qa|sandbox|production)
    echo "✅ Valid environment: $ENVIRONMENT"
    ;;
  *)
    echo "❌ Invalid environment. Use: qa, sandbox, or production"
    exit 1
    ;;
esac

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Set project reference based on environment
case $ENVIRONMENT in
  qa)
    PROJECT_REF=${SUPABASE_QA_PROJECT_REF:-"your-qa-project-ref"}
    ;;
  sandbox)
    PROJECT_REF=${SUPABASE_SANDBOX_PROJECT_REF:-"your-sandbox-project-ref"}
    ;;
  production)
    PROJECT_REF=${SUPABASE_PROD_PROJECT_REF:-"your-prod-project-ref"}
    ;;
esac

echo "📡 Linking to Supabase project: $PROJECT_REF"

# Link to the appropriate Supabase project
supabase link --project-ref $PROJECT_REF

# Deploy functions
if [ "$FUNCTION_NAME" = "all" ]; then
    echo "🔧 Deploying all functions..."
    
    # Deploy each function with environment-specific secrets
    for func in flags metrics dev health; do
        echo "📤 Deploying function: $func"
        supabase functions deploy $func \
            --project-ref $PROJECT_REF
    done
else
    echo "📤 Deploying function: $FUNCTION_NAME"
    supabase functions deploy $FUNCTION_NAME \
        --project-ref $PROJECT_REF
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   - ENVIRONMENT=$ENVIRONMENT"
echo "   - ADMIN_SECRET=your-secret"
echo "   - POSTHOG_API_KEY=your-key"
echo ""
echo "2. Test the endpoints:"
case $ENVIRONMENT in
  qa)
    echo "   https://$PROJECT_REF.supabase.co/functions/v1/health"
    echo "   https://$PROJECT_REF.supabase.co/functions/v1/flags"
    ;;
  sandbox)
    echo "   https://$PROJECT_REF.supabase.co/functions/v1/health"
    echo "   https://$PROJECT_REF.supabase.co/functions/v1/flags"
    ;;
  production)
    echo "   https://$PROJECT_REF.supabase.co/functions/v1/health"
    echo "   https://$PROJECT_REF.supabase.co/functions/v1/flags"
    echo "   (dev endpoints will return 404 in production)"
    ;;
esac