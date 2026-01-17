@echo off
title CARDINSIGHT PRO LOCAL DEVELOPMENT
echo ============================================
echo    CARDINSIGHT PRO - LOCAL DEVELOPMENT
echo ============================================
echo.

echo 1. Starting Backend on http://127.0.0.1:8000...
cd /d C:\Users\kundu\CorporateCardAnalytics\backend
start cmd /k "venv\Scripts\activate && uvicorn server:app --host 127.0.0.1 --port 8000"

echo.
echo 2. Starting Frontend on http://localhost:3000...
cd /d C:\Users\kundu\CorporateCardAnalytics\frontend
start cmd /k "npm start"

echo.
echo 3. Opening dashboard...
echo Local Dashboard: http://localhost:3000
echo Local API: http://127.0.0.1:8000
echo Production App: https://cardinsight-pro.onrender.com
echo.
timeout /t 3 /nobreak >nul
start http://localhost:3000
pause