@echo off
echo ========================================
echo NextGen Environment Check
echo ========================================
echo.

echo Checking Backend .env...
if exist "backend\.env" (
    echo [OK] backend\.env exists
    findstr /C:"DATABASE_URL" backend\.env >nul 2>&1
    if errorlevel 1 (
        findstr /C:"POSTGRES_URL" backend\.env >nul 2>&1
        if errorlevel 1 (
            echo [WARNING] Missing DATABASE_URL or POSTGRES_URL
            echo           PostgreSQL connection required for NextGen features
        ) else (
            echo [OK] POSTGRES_URL found
        )
    ) else (
        echo [OK] DATABASE_URL found
    )
    
    findstr /C:"JWT_SECRET" backend\.env >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Missing JWT_SECRET
    ) else (
        echo [OK] JWT_SECRET found
    )
    
    findstr /C:"GEMINI_API_KEY" backend\.env >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Missing GEMINI_API_KEY
    ) else (
        echo [OK] GEMINI_API_KEY found
    )
) else (
    echo [ERROR] backend\.env not found!
)

echo.
echo Checking Frontend .env...
if exist "frontend\.env" (
    echo [OK] frontend\.env exists
    findstr /C:"VITE_BASE_URL" frontend\.env >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Missing VITE_BASE_URL
    ) else (
        echo [OK] VITE_BASE_URL found
    )
    
    findstr /C:"VITE_FIREBASE_API_KEY" frontend\.env >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Missing VITE_FIREBASE_API_KEY
    ) else (
        echo [OK] VITE_FIREBASE_API_KEY found
    )
) else (
    echo [ERROR] frontend\.env not found!
)

echo.
echo ========================================
echo Check Complete
echo ========================================
echo.
echo If you see warnings, please update your .env files
echo See SETUP.md or QUICKSTART.md for required variables
echo.
pause
