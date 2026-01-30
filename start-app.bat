@echo off
echo ========================================
echo Starting NextGen Application
echo ========================================
echo.

REM Check if .env files exist
if not exist "backend\.env" (
    echo ERROR: backend\.env file not found!
    echo Please create backend\.env with required variables
    echo See SETUP.md or QUICKSTART.md for details
    pause
    exit /b 1
)

if not exist "frontend\.env" (
    echo ERROR: frontend\.env file not found!
    echo Please create frontend\.env with required variables
    echo See SETUP.md or QUICKSTART.md for details
    pause
    exit /b 1
)

echo Starting Backend Server...
start "NextGen Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "NextGen Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers are starting!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Close these windows to stop the servers
echo ========================================
pause
