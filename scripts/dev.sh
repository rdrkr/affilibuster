#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.

# Start all Affilibuster services in one terminal
# Usage: make dev OR ./scripts/dev.sh

set -e

echo "🚀 Starting Affilibuster Development Environment..."
echo ""

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."

    # Kill frontend if running
    if [ ! -z "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "   Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # Stop Docker services
    echo "   Stopping Docker services..."
    docker-compose down

    echo "✅ All services stopped"
    exit 0
}

# Register cleanup function for Ctrl+C and script exit
trap cleanup SIGINT SIGTERM EXIT

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start Docker services (backend, postgres, redis, strapi)
echo "📦 Starting Docker services (PostgreSQL, Redis, Backend, CMS)..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check if backend is running
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Backend not responding after 30 seconds"
        echo "   Check logs: docker-compose logs backend"
    fi
    sleep 1
done

# Install frontend dependencies if needed
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies (first time)..."
    cd "$PROJECT_ROOT/frontend"
    npm install --silent
    cd "$PROJECT_ROOT"
else
    echo "✅ Frontend dependencies already installed"
fi

# Start frontend in background with output to console
echo "🌐 Starting Frontend..."
cd "$PROJECT_ROOT/frontend"

# Use a subshell to run frontend and capture its PID
npm run dev 2>&1 | sed 's/^/[FRONTEND] /' &
FRONTEND_PID=$!

cd "$PROJECT_ROOT"

# Give frontend a moment to start
sleep 3

echo ""
echo "✅ All services are running!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Access your applications:"
echo "   🌐 Frontend:       http://localhost:3000"
echo "   🔌 Backend API:    http://localhost:8000"
echo "   📚 API Docs:       http://localhost:8000/docs"
echo "   🎨 CMS Admin:      http://localhost:1337/admin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Service Status:"
echo "   - PostgreSQL:      Running (port 5432)"
echo "   - Redis:           Running (port 6379)"
echo "   - Backend API:     Running (port 8000)"
echo "   - Strapi CMS:      Starting... (port 1337)"
echo "   - Frontend:        Running (port 3000, PID: $FRONTEND_PID)"
echo ""
echo "💡 Tips:"
echo "   - Press Ctrl+C to stop all services"
echo "   - View Docker logs: docker-compose logs -f"
echo "   - Run tests: make test"
echo ""
echo "🎉 Happy coding!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for frontend process (this keeps the script running)
wait $FRONTEND_PID
