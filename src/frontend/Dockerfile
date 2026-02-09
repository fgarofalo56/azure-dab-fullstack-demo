# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL=/api
ARG VITE_GRAPHQL_URL=/graphql
ARG VITE_AZURE_AD_CLIENT_ID
ARG VITE_AZURE_AD_TENANT_ID
ARG VITE_DAB_CLIENT_ID

# Set environment variables for build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GRAPHQL_URL=${VITE_GRAPHQL_URL}
ENV VITE_AZURE_AD_CLIENT_ID=${VITE_AZURE_AD_CLIENT_ID}
ENV VITE_AZURE_AD_TENANT_ID=${VITE_AZURE_AD_TENANT_ID}
ENV VITE_DAB_CLIENT_ID=${VITE_DAB_CLIENT_ID}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health check
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
