@echo off
echo Starting SkillSwap...
echo.

echo [1/2] Starting Backend Server...
start "SkillSwap Backend" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend...
start "SkillSwap Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo SkillSwap is starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Demo Login: ayesha@demo.com / password123
pause
