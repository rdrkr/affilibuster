# Copyright (c) 2025 Affilibuster by Ronen Druker.

FROM python:3.13-slim

WORKDIR /app

# Install system dependencies and uv
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Copy pyproject.toml and uv.lock for dependency resolution
COPY pyproject.toml uv.lock ./

# Install dependencies including dev (--no-install-project means don't build affilibuster-backend itself)
RUN /root/.local/bin/uv sync --frozen --no-install-project

# Copy application code
COPY . .

# Make startup script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port (configurable via ARG)
ARG BACKEND_PORT
EXPOSE ${BACKEND_PORT}

# Run the application with startup script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
