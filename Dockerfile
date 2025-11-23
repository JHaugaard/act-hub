# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app (production mode)
ARG VITE_DATA_SOURCE=pocketbase
ARG VITE_POCKETBASE_URL
ENV VITE_DATA_SOURCE=$VITE_DATA_SOURCE
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL

RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (fly.io default)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
