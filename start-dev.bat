@echo off
echo Starting Driver App Development Environment...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Admin Panel: http://localhost:5173/admin
echo.
pause
