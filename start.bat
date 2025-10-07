@echo off
echo ========================================
echo   WOOVB - Video Hosting Platform
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...
pip show Flask >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    echo Dependencies already installed.
)

echo.
echo [2/3] Creating upload directories...
if not exist "uploads\videos" mkdir uploads\videos
echo Directories ready.

echo.
echo [3/3] Starting WOOVB...
echo.
echo ========================================
echo   WOOVB Server - http://localhost:5000
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

python app.py

pause

