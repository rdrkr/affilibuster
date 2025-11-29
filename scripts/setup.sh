#!/usr/bin/env bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

set -e

echo "🔧 Setting up development environment..."

# Detect OS
if [[ "${OSTYPE}" == "darwin"* ]]; then
  OS="macos"
  echo "  📦 macOS detected - using Homebrew"

  # Install Homebrew if not present
  if ! command -v brew >/dev/null 2>&1; then
    echo "  Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || {
      echo "❌ Failed to install Homebrew"
      exit 1
    }
  else
    echo "  ✅ Homebrew already installed"
  fi
else
  OS="linux"
  echo "  📦 Linux detected - using apt-get"
fi

# Install system development tools
echo "📦 Installing system development tools..."

# Helper function to install via brew
# Parameters:
#   $1: package name (as it appears in brew)
#   $2: executable name (optional, defaults to package name)
install_brew() {
  local package=$1
  local executable=${2:-$1}
  if ! command -v "${executable}" >/dev/null 2>&1; then
    echo "  Installing ${package}..."
    brew install "${package}" || echo "  ⚠️  Failed to install ${package}"
  else
    echo "  ✅ ${package} already installed"
  fi
}

# Helper function to install via apt
install_apt() {
  local package=$1
  local apt_name=${2:-$1} # Use custom apt package name if provided
  if ! command -v "${package}" >/dev/null 2>&1; then
    echo "  Installing ${package}..."
    sudo apt-get update >/dev/null
    sudo apt-get install -y "${apt_name}" || echo "  ⚠️  Failed to install ${package}"
  else
    echo "  ✅ ${package} already installed"
  fi
}

# Helper function to install via pip (fallback)
install_pip() {
  local package=$1
  if ! command -v "${package}" >/dev/null 2>&1 && ! python3 -m pip show "${package}" >/dev/null 2>&1; then
    echo "  Installing ${package}..."
    python3 -m pip install "${package}" >/dev/null || echo "  ⚠️  Failed to install ${package}"
  else
    echo "  ✅ ${package} already installed"
  fi
}

# Install tools based on OS
if [[ "${OS}" = "macos" ]]; then
  # System tools
  install_brew "pre-commit"
  install_brew "shfmt"
  install_brew "shellcheck"
  install_brew "checkmake"
  install_brew "mkcert"
  install_brew "git-lfs"

  # Python dependency manager and tools
  install_brew "uv"

  # OpenAPI validation and linting
  install_brew "redocly-cli" "redocly"
else
  # System tools
  install_apt "pre-commit" "pre-commit"
  install_apt "shfmt" "shfmt"
  install_apt "shellcheck" "shellcheck"
  install_apt "mkcert" "mkcert"
  install_apt "git-lfs" "git-lfs"

  # checkmake (Go binary - install from GitHub releases)
  if ! command -v checkmake >/dev/null 2>&1; then
    echo "  Installing checkmake..."
    CHECKMAKE_VERSION="0.2.2"
    curl -sSL "https://github.com/mrtazz/checkmake/releases/download/${CHECKMAKE_VERSION}/checkmake-${CHECKMAKE_VERSION}.linux.amd64" -o /tmp/checkmake &&
      sudo mv /tmp/checkmake /usr/local/bin/checkmake &&
      sudo chmod +x /usr/local/bin/checkmake ||
      echo "  ⚠️  Failed to install checkmake"
  else
    echo "  ✅ checkmake already installed"
  fi

  # Python dependency manager (not in apt, use official installer)
  if ! command -v uv >/dev/null 2>&1; then
    echo "  Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null || echo "  ⚠️  Failed to install uv"
    # Add uv to PATH for this session
    export PATH="/root/.cargo/bin:${PATH}"
  else
    echo "  ✅ uv already installed"
  fi

  # OpenAPI validation and linting (not in apt, use npm)
  if ! command -v redocly &>/dev/null; then
    echo "  Installing redocly-cli..."
    npm install -g @redocly/cli >/dev/null || echo "  ⚠️  Failed to install redocly-cli"
  else
    echo "  ✅ redocly-cli already installed"
  fi
fi

echo "🔐 Generating HTTPS certificates for development..."

# Create certs directory if it doesn't exist
if [[ ! -d "certs" ]]; then
  mkdir -p certs
  echo "  ✅ Created certs directory"
fi

# Generate SSL certificates if they don't exist
if [[ ! -f "certs/localhost.pem" ]] || [[ ! -f "certs/localhost-key.pem" ]]; then
  if command -v mkcert >/dev/null 2>&1; then
    echo "  Installing mkcert root CA (may require sudo password)..."
    mkcert -install || echo "  ⚠️  Failed to install mkcert CA (continuing anyway)"

    echo "  Generating localhost certificates with Docker hostnames..."
    cd certs
    mkcert localhost 127.0.0.1 ::1 backend frontend strapi strapi-proxy || {
      echo "  ❌ Failed to generate certificates"
      cd ..
      exit 1
    }

    # Rename files to simpler names
    mv localhost+6.pem localhost.pem 2>/dev/null || true
    mv localhost+6-key.pem localhost-key.pem 2>/dev/null || true
    cd ..

    echo "  ✅ SSL certificates generated successfully"
  else
    echo "  ⚠️  mkcert not installed - skipping certificate generation"
    echo "     Run 'brew install mkcert' (macOS) or 'sudo apt install mkcert' (Linux)"
  fi
else
  echo "  ✅ SSL certificates already exist"
fi

# Copy mkcert root CA if it doesn't exist
if [[ ! -f "certs/rootCA.pem" ]]; then
  if command -v mkcert >/dev/null 2>&1; then
    echo "  Copying mkcert root CA certificate..."
    CAROOT=$(mkcert -CAROOT)
    if [[ -f "${CAROOT}/rootCA.pem" ]]; then
      cp "${CAROOT}/rootCA.pem" certs/rootCA.pem || {
        echo "  ⚠️  Failed to copy root CA certificate"
      }
      echo "  ✅ Root CA certificate copied successfully"
    else
      echo "  ⚠️  Root CA certificate not found at ${CAROOT}/rootCA.pem"
    fi
  else
    echo "  ⚠️  mkcert not installed - skipping root CA copy"
  fi
else
  echo "  ✅ Root CA certificate already exists"
fi

echo "📦 Installing project dependencies..."

# Install CMS dependencies
echo "  🧰 Installing cms dependencies..."
cd cms
npm install --silent
cd ..

# Install backend dependencies
echo "  🧰 Installing backend dependencies..."
cd backend
uv sync --quiet
cd ..

# Install frontend dependencies
echo "  🧰 Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

# Install ecopicks dependencies
echo "  🧰 Installing ecopicks dependencies..."
cd ecopicks
npm install --silent
cd ..

echo "📦 Installing pre-commit hooks..."
if command -v pre-commit >/dev/null 2>&1; then
  pre-commit install >/dev/null
  echo "  ✅ Pre-commit hooks installed"
else
  echo "  ❌ pre-commit not installed"
  exit 1
fi

echo "📦 Initializing Git LFS..."
if command -v git-lfs >/dev/null 2>&1; then
  git lfs install >/dev/null
  echo "  ✅ Git LFS initialized"
else
  echo "  ❌ git-lfs not installed"
  exit 1
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start services: make dev"
echo "  2. Run tests: make test"
echo "  3. Check code: make lint"
