# Multi-stage build for Frontend Static Files
FROM nginx:alpine AS base

# Install additional tools
RUN apk add --no-cache \
    curl \
    bash

# Development stage
FROM base AS development
COPY . /usr/share/nginx/html/
COPY nginx.dev.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Production stage  
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Copy static files
COPY --chown=nginx-user:nginx-user . /usr/share/nginx/html/

# Copy optimized nginx configuration
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
