@echo off
echo Applying database schema...
set PGPASSWORD=Shingala99258
psql -h localhost -U postgres -d nextgen -f database/schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo Error applying schema. Make sure PostgreSQL is running and psql is in your PATH.
    pause
    exit /b %ERRORLEVEL%
)
echo Schema applied successfully!
pause
