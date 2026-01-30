@echo off
echo ===========================================
echo Setting up NextGen Database...
echo ===========================================

cd backend
call node init_db.js
if errorlevel 1 (
    echo.
    echo ERROR: Database setup failed!
    echo Please check your connection string in backend\.env
    pause
    exit /b 1
)

echo.
echo ===========================================
echo Database Setup Complete!
echo You can now restart the app.
echo ===========================================
pause
