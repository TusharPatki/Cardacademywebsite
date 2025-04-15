FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Set npm environment variables
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_STRICT_SSL=false
ENV NPM_CONFIG_NETWORK_TIMEOUT=100000
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"] 