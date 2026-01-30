@echo off
echo ===========================================
echo Fixing NextGen Dependencies...
echo ===========================================

echo.
echo [1/2] Installing Backend Dependencies (pg)...
cd backend
call npm install pg --save
call npm install
if errorlevel 1 (
    echo ERROR: Backend install failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Installing Frontend Dependencies (lucide-react)...
cd frontend
call npm install lucide-react --save
call npm install
if errorlevel 1 (
    echo ERROR: Frontend install failed!
    pause
    exit /b 1
)
cd ..

echo.
echo ===========================================
echo Fix Complete!
echo You can now run start-app.bat
echo ===========================================
pause
