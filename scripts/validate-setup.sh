#!/bin/bash
# Copyright (c) 2025 Affilibuster by Ronen Druker.
#
# Validation script for Core Platform Setup
# This script validates that all components are properly configured
# Reference: quickstart.md (Verification Tests)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Affilibuster Platform Validation"
echo "========================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Counter for passed/failed checks
PASSED=0
FAILED=0

# 1. Check prerequisites
echo "1. Checking Prerequisites..."
echo "----------------------------"

if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
    PASSED=$((PASSED+1))
else
    echo -e "${RED}✗${NC} Node.js not found"
    FAILED=$((FAILED+1))
fi

if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python installed: $PYTHON_VERSION"
    PASSED=$((PASSED+1))
else
    echo -e "${RED}✗${NC} Python 3 not found"
    FAILED=$((FAILED+1))
fi

echo ""

# Summary
echo "========================================="
echo "Validation Summary"
echo "========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed.${NC}"
    exit 1
fi
