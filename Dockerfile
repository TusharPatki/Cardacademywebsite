FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ git

# Set npm environment variables
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_STRICT_SSL=false
ENV NPM_CONFIG_NETWORK_TIMEOUT=100000
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
ENV NODE_ENV=development
ENV SKIP_DB_MIGRATIONS=true
ENV SKIP_DB_SEED=true

# Copy all files
COPY . .

# Install dependencies and disable postinstall script
RUN npm install --ignore-scripts --legacy-peer-deps

# Install tsx for running TypeScript directly
RUN npm install -g tsx

# Set environment variables
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose the port
EXPOSE 3000

# Start the application in development mode
CMD ["tsx", "server/index.ts"] 