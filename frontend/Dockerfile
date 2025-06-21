# Frontend Dockerfile
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

# Production image with nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]