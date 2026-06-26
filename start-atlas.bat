@echo off
title ATLAS - ISE Mission Control
cd /d "%~dp0"

echo.
echo [ATLAS] Starting live development server...
echo [ATLAS] Browser will open in a moment.
echo [ATLAS] Keep this window open for automatic updates.
echo.

:: Open browser after 3 seconds without extra window
start "" /b cmd /c "timeout /t 3 >nul 2>&1 && start http://localhost:5173"

npm run dev

echo.
echo [ATLAS] Server stopped. Press any key to close.
pause >nul
