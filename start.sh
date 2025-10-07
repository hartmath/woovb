#!/bin/bash

echo "========================================"
echo "  WOOVB - Video Hosting Platform"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null
then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "[1/3] Checking dependencies..."
if ! python3 -c "import flask" 2>/dev/null; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
else
    echo "Dependencies already installed."
fi

echo ""
echo "[2/3] Creating upload directories..."
mkdir -p uploads/videos
echo "Directories ready."

echo ""
echo "[3/3] Starting WOOVB..."
echo ""
echo "========================================"
echo "  WOOVB Server - http://localhost:5000"
echo "  Press Ctrl+C to stop the server"
echo "========================================"
echo ""

python3 app.py

