# Copyright (c) 2025 Affilibuster by Ronen Druker.

FROM node:24-slim

WORKDIR /app

# Install dependencies for Playwright (browsers will be installed on-demand during tests)
# These are minimal system dependencies required by Playwright
RUN apt-get update && apt-get install -y \
    # Shell and utilities
    bash \
    curl \
    ca-certificates \
    # Playwright system dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Make startup script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port (configurable via ARG)
ARG FRONTEND_PORT
EXPOSE ${FRONTEND_PORT}

# Run the application with startup script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
