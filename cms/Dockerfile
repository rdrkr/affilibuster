# Copyright (c) 2025 Affilibuster by Ronen Druker.

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 1337

# Run the application
CMD ["npm", "run", "develop"]
