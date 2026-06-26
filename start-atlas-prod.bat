@echo off
title ATLAS - ISE Mission Control (Production)
cd /d "%~dp0"

echo.
echo [ATLAS] Building latest version...
call npm run build

if errorlevel 1 (
  echo Build failed. Press any key to close.
  pause >nul
  exit /b
)

echo.
echo [ATLAS] Starting production preview (no live edits)...
echo [ATLAS] Browser will open in a moment.
echo.

start "" /b cmd /c "timeout /t 2 >nul 2>&1 && start http://localhost:5173"

npm run preview

echo.
echo [ATLAS] Stopped.
pause >nul
