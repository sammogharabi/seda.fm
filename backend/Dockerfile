# Use Node.js 18 (Debian-based for better Prisma compatibility)
# IMPORTANT: DO NOT use node:18-alpine as it causes Prisma SSL library errors
# Alpine Linux lacks libssl.so.1.1 required by Prisma's query engine
# Debian-based image includes proper OpenSSL libraries
FROM node:18

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Clean up dev dependencies
RUN npm ci --only=production && npm cache clean --force

# Railway sets PORT dynamically - don't hardcode EXPOSE

# Health check disabled for debugging
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

# Start the application using our startup script
CMD ["./start.sh"]