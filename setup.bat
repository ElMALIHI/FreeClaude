@echo off
REM Setup script for Claude OpenAI Wrapper (Windows)

echo Setting up Claude OpenAI Wrapper...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js 20+ first.
    exit /b 1
)

echo Node.js version:
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install npm first.
    exit /b 1
)

echo npm version:
npm --version

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    exit /b 1
)

echo Dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created. Please edit it with your configuration.
) else (
    echo .env file already exists
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Make sure Redis is running (or use Docker Compose)
echo 3. Start the server with: npm start
echo.
echo To run with Docker:
echo   docker-compose up
echo.

pause
