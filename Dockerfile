# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Set the API URL directly (Cloud Run's --set-build-env-vars doesn't work reliably)
ENV VITE_API_URL=https://annotation-tool-api-318402319858.us-central1.run.app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (excluding .env files via .dockerignore)
COPY . .

# Debug: Print the environment variable
RUN echo "Building with VITE_API_URL: $VITE_API_URL"

# Build the Vite app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
