# Use Node.js 18 LTS
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

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

# Expose port (Railway will set PORT env var dynamically)
EXPOSE 3001

# Health check disabled for debugging
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

# Start the application directly
CMD ["node", "dist/main.js"]