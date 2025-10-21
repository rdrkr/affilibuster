# Copyright (c) 2025 Affilibuster by Ronen Druker.

FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (configurable via ARG)
ARG FRONTEND_PORT
EXPOSE ${FRONTEND_PORT}

# Run the application
CMD ["npm", "run", "dev"]
