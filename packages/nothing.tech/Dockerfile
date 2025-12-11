# Use an official Node.js image
FROM node:24.12.0-slim

# Set working directory inside the container
WORKDIR /app

# Update package list and install Chromium along with required dependencies
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  lsb-release \
  stockfish \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

# Set CHROMIUM_EXECUTABLE_PATH
ENV CHROMIUM_EXECUTABLE_PATH="/usr/bin/chromium"

# Copy package.json and package-lock.json (for better caching)
COPY . .

# Install dependencies using pnpm
RUN corepack enable && pnpm install && pnpm run build

# Expose the server port
EXPOSE 10000

# Command to start the server
CMD ["pnpm", "start"]
