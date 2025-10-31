# Copyright (c) 2025 Affilibuster by Ronen Druker.

FROM node:24-alpine

WORKDIR /app

# Copy application code
COPY . .

# Make startup script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port (configurable via ARG)
ARG FRONTEND_PORT
EXPOSE ${FRONTEND_PORT}

# Run the application with startup script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
