# Copyright (c) 2025 Affilibuster by Ronen Druker.

FROM node:22.21-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy application code
COPY . .

# Make startup script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port (configurable via ARG)
ARG CMS_PORT
EXPOSE ${CMS_PORT}

# Run the application with startup script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
