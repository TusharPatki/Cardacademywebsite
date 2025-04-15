FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Set npm configuration
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm config set network-timeout 100000

# Install dependencies with specific flags
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"] 