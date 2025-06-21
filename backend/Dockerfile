# Backend Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
COPY ../shared/package*.json ../shared/
RUN npm ci --only=production

# Build application
FROM base AS builder
COPY package*.json ./
COPY ../shared/ ../shared/
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 monarch

COPY --from=deps --chown=monarch:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=monarch:nodejs /app/dist ./dist
COPY --from=builder --chown=monarch:nodejs /app/package.json ./package.json

# Create directories
RUN mkdir -p /app/logs /app/uploads && chown -R monarch:nodejs /app/logs /app/uploads

USER monarch

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]