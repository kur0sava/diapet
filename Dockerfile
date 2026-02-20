# DiaPet - Development Environment Docker Image
# NOTE: React Native requires Android SDK and physical/virtual device for actual builds.
# This Dockerfile provides a Node.js development environment for JS bundling and Metro server.
# For actual Android/iOS builds, use EAS Build (cloud) or local Android Studio / Xcode.

FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    python3 \
    make \
    g++ \
    openjdk17-jre-headless

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Expose Expo DevTools port
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start Metro bundler
CMD ["npx", "expo", "start", "--no-dev", "--minify"]
