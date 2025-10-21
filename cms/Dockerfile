# Copyright (c) 2025 Affilibuster by Ronen Druker.

FROM node:22.21-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy application code
COPY . .

# Expose port (configurable via ARG)
ARG CMS_PORT
EXPOSE ${CMS_PORT}

# Run the application
CMD sh -c "npm install --legacy-peer-deps && npm run develop"
