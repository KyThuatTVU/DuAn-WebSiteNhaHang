# 🍽️ Restaurant Management System - Multi-stage Docker Build
# Stage 1: Backend Build
FROM node:18-alpine AS backend-build

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend source code
COPY backend/ ./

# Create necessary directories
RUN mkdir -p logs images public

# Set proper permissions
RUN chown -R node:node /app/backend
USER node

# Stage 2: Frontend Build (Static files)
FROM nginx:alpine AS frontend-build

# Copy frontend files
COPY frontend/ /usr/share/nginx/html/

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Stage 3: Final Production Image
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    mysql-client \
    curl \
    bash \
    tzdata

# Set timezone
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend from build stage
COPY --from=backend-build --chown=nodejs:nodejs /app/backend ./backend

# Copy frontend files
COPY --from=frontend-build /usr/share/nginx/html ./frontend

# Copy database scripts
COPY QuanLyDBWeb/ ./database/

# Copy Docker scripts
COPY docker/ ./docker/

# Create necessary directories with proper permissions
RUN mkdir -p \
    ./backend/logs \
    ./backend/images \
    ./backend/public \
    ./uploads \
    ./data && \
    chown -R nodejs:nodejs /app

# Install global dependencies
RUN npm install -g pm2

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3000 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Default command
CMD ["npm", "run", "docker:start"]
