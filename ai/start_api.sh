#!/bin/bash

# VERDA AI API Startup Script
# This script checks for trained models and starts the FastAPI server

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}VERDA AI API Startup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if models directory exists and has model files
if [ ! -d "models" ] || [ -z "$(ls -A models/*.pkl 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠ Models not found!${NC}"
    echo -e "${YELLOW}Training models first...${NC}"
    echo ""
    
    # Run trainer
    python3 trainer.py
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Training failed!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Training completed successfully${NC}"
    echo ""
fi

# Check if models exist now
if [ ! -f "models/waste.pkl" ]; then
    echo -e "${RED}✗ Models still not found after training!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Models found${NC}"
echo ""

# Start the API server
echo -e "${GREEN}Starting FastAPI server...${NC}"
echo -e "${GREEN}API will be available at:${NC}"
echo -e "  - Local:   ${GREEN}http://localhost:8000${NC}"
echo -e "  - Swagger: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "  - ReDoc:   ${GREEN}http://localhost:8000/redoc${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start uvicorn with hot reload for development
python3 -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
