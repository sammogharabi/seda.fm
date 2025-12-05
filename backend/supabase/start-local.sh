#!/bin/bash

# Start Supabase Edge Functions locally for development
# This script sets up the local development environment

set -e

echo "🏠 Starting Sedā.fm Edge Functions locally"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "config.toml" ]; then
    echo "❌ config.toml not found. Make sure you're in the supabase directory."
    exit 1
fi

# Initialize Supabase if not already done
if [ ! -d ".supabase" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
fi

# Start Supabase services
echo "🚀 Starting Supabase services..."
supabase start

echo ""
echo "✅ Supabase Edge Functions are now running locally!"
echo ""
echo "📡 API Gateway: http://localhost:54321"
echo "🎛️  Studio: http://localhost:54323"
echo ""
echo "🔗 Edge Function URLs:"
echo "   Health: http://localhost:54321/functions/v1/health"
echo "   Flags:  http://localhost:54321/functions/v1/flags"
echo "   Metrics: http://localhost:54321/functions/v1/metrics"
echo "   Dev:    http://localhost:54321/functions/v1/dev/info"
echo ""
echo "🛠️  To deploy a function after changes:"
echo "   supabase functions deploy [function-name]"
echo ""
echo "🔄 To restart with fresh data:"
echo "   supabase stop && supabase start"
echo ""
echo "📋 Environment variables should be set in:"
echo "   - supabase/.env.local (for local development)"
echo "   - Supabase Dashboard > Edge Functions > Environment Variables"