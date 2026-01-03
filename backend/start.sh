#!/bin/sh
echo "Starting Seda Auth Service..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Set NODE_ENV to sandbox if not already set
export NODE_ENV=${NODE_ENV:-sandbox}

echo "Using NODE_ENV: $NODE_ENV"
echo "Starting application..."

# Start the application
exec node dist/src/main.js