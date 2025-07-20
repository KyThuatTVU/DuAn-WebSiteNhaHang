# Multi-stage Dockerfile for Website Nhà Hàng
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

# Create logs directory
RUN mkdir -p logs

# Stage 2: Frontend Build  
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
    tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend from build stage
COPY --from=backend-build --chown=nodejs:nodejs /app/backend ./backend

# Copy frontend files
COPY --from=frontend-build --chown=nodejs:nodejs /usr/share/nginx/html ./frontend

# Copy database files
COPY --chown=nodejs:nodejs QuanLyDBWeb/ ./database/

# Copy docker scripts
COPY --chown=nodejs:nodejs docker/scripts/ ./scripts/

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Create necessary directories
RUN mkdir -p /app/backend/logs /app/backend/images && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start command
CMD ["./scripts/start.sh"]
