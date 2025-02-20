# Use Node.js as the base image
FROM node:18-alpine

RUN apk add --no-cache python3 py3-pip && \
    python3 --version && pip3 --version
# Install AWS CLI
RUN pip install --break-system-packages awscli && \
    aws --version

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
# Install dependencies with legacy-peer-deps
RUN npm install --legacy-peer-deps
RUN npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser --legacy-peer-deps
# Copy the rest of the application
COPY . .

# Add environment variables for the S3 bucket and AWS region
ARG AWS_REGION
ARG S3_BUCKET_NAME
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_REGION=${AWS_REGION}
ENV S3_BUCKET_NAME=${S3_BUCKET_NAME}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
# Debug environment
RUN echo "Environment Variables:" && env

# Configure AWS CLI
RUN aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID && \
    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY && \
    aws configure set region $AWS_REGION
RUN aws s3 cp s3://$S3_BUCKET_NAME/.env /app/.env --region $AWS_REGION
# Build the Next.js app
RUN npm run build

# Expose the default Next.js port

# Start the Next.js app
CMD ["sh", "-c", "aws s3 cp s3://treasure-hunt-env-bucket/.env /app/.env && npm start"]
EXPOSE 3000
