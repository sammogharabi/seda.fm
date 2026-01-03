#!/bin/sh
echo "Starting Seda Auth Service..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Set NODE_ENV to sandbox if not already set
export NODE_ENV=${NODE_ENV:-sandbox}

echo "Using NODE_ENV: $NODE_ENV"

# Run database migrations
echo "Running database migrations..."
npx prisma db push --accept-data-loss || echo "Migration warning (may be expected if no changes)"

echo "Starting application..."

# Start the application
exec node dist/src/main.js