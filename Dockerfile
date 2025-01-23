# Use Node.js as the base image
FROM node:18-alpine

# Install AWS CLI
RUN apk add --no-cache python3 py3-pip aws-cli

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
# Install dependencies with legacy-peer-deps
RUN npm install --legacy-peer-deps
RUN npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser --legacy-peer-deps
# Copy the rest of the application
COPY . .

# Copy .env from S3 during the build
ARG AWS_REGION
ARG S3_BUCKET_NAME
RUN aws s3 cp s3://$S3_BUCKET_NAME/.env /app/.env --region $AWS_REGION

# Build the Next.js app
RUN npm run build

# Expose the default Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]