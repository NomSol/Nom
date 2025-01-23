# Use Node.js as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists) and install dependencies
COPY package*.json ./

# Install dependencies with a clean environment
RUN npm ci --legacy-peer-deps

# Install additional dev dependencies if needed
RUN npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the default Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]