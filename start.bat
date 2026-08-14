@echo off
setlocal

set "ROOT=%~dp0"
set "PG_BIN=%ROOT%backend\postgresql\pgsql\bin"
set "PG_DATA=%ROOT%backend\postgresql\pgsql\data"
set "PG_LOG=%ROOT%backend\postgresql\pgsql\pg.log"

echo ============================================
echo   Math Olympiad - Startup Script
echo ============================================
echo.

:: --- Step 1: Kill any stale postgres processes ---
echo [1/4] Cleaning up old processes...
taskkill /F /IM postgres.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul

:: --- Step 2: Remove stale postmaster.pid if exists ---
if exist "%PG_DATA%\postmaster.pid" (
    echo       Removing stale postmaster.pid...
    del /F "%PG_DATA%\postmaster.pid"
)

:: --- Step 3: Start PostgreSQL ---
echo [2/4] Starting PostgreSQL...
start "PostgreSQL" /B "%PG_BIN%\postgres.exe" -D "%PG_DATA%"

:: Wait for PostgreSQL to be ready (poll port 5432)
set /a attempts=0
:wait_pg
timeout /t 1 /nobreak >nul
set /a attempts+=1
netstat -ano | findstr ":5432" >nul 2>&1
if errorlevel 1 (
    if %attempts% lss 15 (
        echo       Waiting for PostgreSQL... [%attempts%/15]
        goto wait_pg
    ) else (
        echo [ERROR] PostgreSQL failed to start after 15 seconds!
        echo         Check log: %PG_LOG%
        pause
        exit /b 1
    )
)
echo       PostgreSQL ready on port 5432!

:: --- Step 4: Start FastAPI Backend ---
echo [3/4] Starting FastAPI Backend (port 8000)...
start "FastAPI Backend" /B cmd /c "cd /d "%ROOT%backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "%ROOT%backend\backend.log" 2>&1"
timeout /t 3 /nobreak >nul
echo       Backend starting at http://localhost:8000

:: --- Step 5: Start Vite Frontend ---
echo [4/4] Starting Vite Frontend (port 3000)...
start "Vite Frontend" /B cmd /c "cd /d "%ROOT%" && npm run dev > "%ROOT%frontend.log" 2>&1"
timeout /t 3 /nobreak >nul
echo       Frontend starting at http://localhost:3000

echo.
echo ============================================
echo   All services started!
echo   - Frontend : http://localhost:3000
echo   - Backend  : http://localhost:8000
echo   - API Docs : http://localhost:8000/docs
echo ============================================
echo.
echo Logs:
echo   PostgreSQL : %PG_LOG%
echo   Backend    : %ROOT%backend\backend.log
echo   Frontend   : %ROOT%frontend.log
echo.
echo Press any key to STOP all services...
pause >nul

echo.
echo Stopping all services...
taskkill /F /IM postgres.exe /T >nul 2>&1

:: Find and kill the uvicorn and node processes by window title
taskkill /FI "WINDOWTITLE eq FastAPI Backend" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Vite Frontend" /T /F >nul 2>&1

echo Done. All services stopped.
