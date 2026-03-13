# omb-accounting Dockerfile
# Multi-stage build for production deployment

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only (skip prepare scripts)
RUN npm ci --only=production --ignore-scripts

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (skip prepare scripts)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS production

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache libc6-compat python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built assets from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy package.json for version info
COPY --from=builder /app/package.json ./

# Rebuild better-sqlite3 native bindings
RUN npm rebuild better-sqlite3

# Create data directory for SQLite (before switching to nextjs user)
RUN mkdir -p /app/data && chmod 777 /app/data

# Create logs directory
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
