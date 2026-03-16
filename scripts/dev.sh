#!/bin/bash

# Development script with log rotation
# Rotates dev.log to dev-prev.log before starting

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Ecommerce Starter Template...${NC}"

# Stop any existing services on ports 9000 and 3000
echo -e "${BLUE}🧹 Checking for existing services...${NC}"
if lsof -ti:9000 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Stopping existing service on port 9000...${NC}"
    lsof -ti:9000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi
if lsof -ti:3000 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Stopping existing service on port 3000...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi
echo -e "${GREEN}✅ Ports cleared${NC}"

# Rotate logs
if [ -f "dev.log" ]; then
    echo -e "${YELLOW}📝 Rotating logs: dev.log → dev-prev.log${NC}"
    mv dev.log dev-prev.log
fi

# Check if Docker services are running
echo -e "${BLUE}🐳 Checking Docker services...${NC}"
cd backend
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Starting Docker services...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Docker services started${NC}"
else
    echo -e "${GREEN}✅ Docker services already running${NC}"
fi
cd ..

# Start services with logging
echo -e "${BLUE}🔥 Starting development servers...${NC}"
echo -e "${GREEN}📋 Logs will be written to: dev.log${NC}"
echo -e "${GREEN}📋 Previous logs available at: dev-prev.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    pkill -P $$ 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
(
    echo "=== BACKEND STARTING ==="
    cd backend
    npm run dev 2>&1 | while IFS= read -r line; do
        echo "[BACKEND] $line"
    done
) >> dev.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${BLUE}⏳ Waiting for backend...${NC}"
sleep 5

# Run auto-bootstrap (only on first run)
if [ ! -f ".bootstrap-complete" ]; then
    echo -e "${YELLOW}🔧 First run detected - running auto-setup...${NC}"
    ./scripts/bootstrap.sh >> dev.log 2>&1 || true
else
    echo -e "${GREEN}✅ Bootstrap already completed${NC}"
fi

# Start storefront
(
    echo "=== STOREFRONT STARTING ==="
    cd storefront
    npm run dev 2>&1 | while IFS= read -r line; do
        echo "[STOREFRONT] $line"
    done
) >> dev.log 2>&1 &
STOREFRONT_PID=$!

# Show tail of logs
echo -e "${GREEN}✅ Services started${NC}"
echo -e "${BLUE}📊 Tailing logs (Ctrl+C to stop)...${NC}"
echo ""

# Tail the log file
tail -f dev.log &
TAIL_PID=$!

# Wait for background processes
wait $BACKEND_PID $STOREFRONT_PID $TAIL_PID
