# Copyright (c) 2026 Affilibuster by Ronen Druker.

FROM node:22-slim

WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Make startup script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port (configurable via ARG)
ARG GENTLE_HAWK_PORT
EXPOSE ${GENTLE_HAWK_PORT}

# Run the application with startup script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
