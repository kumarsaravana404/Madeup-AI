@echo off
echo Starting Ollama Chat UI...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!

REM Check if node_modules exists
if not exist "node_modules\" (
    echo.
    echo Installing dependencies...
    call npm install
)

REM Check if Ollama is running
echo.
echo Checking Ollama connection...
curl -s http://localhost:11434/api/tags >nul 2>nul
if %errorlevel% neq 0 (
    echo Warning: Cannot connect to Ollama at http://localhost:11434
    echo Make sure Ollama is running with: ollama serve
    echo.
    set /p continue="Do you want to continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)

echo.
echo Starting server...
echo Server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm start
