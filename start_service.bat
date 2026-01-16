@echo off
title CARDINSIGHT PRO STARTING
echo ============================================
echo    CARDINSIGHT PRO STARTING
echo ============================================
echo.

echo 1. Stopping existing services...
net stop CorporateCardFrontend 2>nul && echo Frontend stopped || echo Frontend not running
net stop CorporateCardBackend 2>nul && echo Backend stopped || echo Backend not running

echo.
echo 2. Killing ALL processes using port 3000...
set killed=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    if not "%%a"=="0" (
        taskkill /F /PID %%a 2>nul
        if !errorlevel! equ 0 (
            echo Killed PID: %%a
            set /a killed+=1
        )
    )
)
if %killed% equ 0 echo No processes to kill

echo.
echo 3. Removing old services completely...
nssm remove CorporateCardFrontend confirm 2>nul && echo Frontend service removed
nssm remove CorporateCardBackend confirm 2>nul && echo Backend service removed

echo.
echo 4. Creating fresh services for port 3000...
set BACKEND_DIR=C:\Users\kundu\CorporateCardAnalytics\backend
set FRONTEND_DIR=C:\Users\kundu\CorporateCardAnalytics\frontend

echo Creating Backend Service...
nssm install CorporateCardBackend "cmd.exe"
nssm set CorporateCardBackend AppDirectory "%BACKEND_DIR%"
nssm set CorporateCardBackend AppParameters "/c \"\"%BACKEND_DIR%\venv\Scripts\python.exe\" -m uvicorn server:app --host 127.0.0.1 --port 8000\""
nssm set CorporateCardBackend DisplayName "Corporate Card Backend"
nssm set CorporateCardBackend Start SERVICE_AUTO_START
nssm set CorporateCardBackend AppStdout "%BACKEND_DIR%\backend.log"

echo Creating Frontend Service (Port 3000)...
nssm install CorporateCardFrontend "cmd.exe"
nssm set CorporateCardFrontend AppDirectory "%FRONTEND_DIR%"
nssm set CorporateCardFrontend AppParameters "/c \"npm start\""
nssm set CorporateCardFrontend DisplayName "Corporate Card Frontend"
nssm set CorporateCardFrontend Start SERVICE_AUTO_START_DELAYED
nssm set CorporateCardFrontend AppStdout "%FRONTEND_DIR%\frontend.log"

echo.
echo 5. Ensuring frontend uses ONLY port 3000...
REM Create a startup script that forces port 3000
echo @echo off > "%FRONTEND_DIR%\start_3000.bat"
echo set PORT=3000 >> "%FRONTEND_DIR%\start_3000.bat"
echo npm start >> "%FRONTEND_DIR%\start_3000.bat"

nssm set CorporateCardFrontend AppParameters "/c \"start_3000.bat\""

echo.
echo 6. Starting services...
net start CorporateCardBackend && echo Backend started || echo Backend failed to start
timeout /t 5 /nobreak >nul
net start CorporateCardFrontend && echo Frontend started on port 3000 || echo Frontend failed to start

echo.
echo 7. Verifying port 3000...
netstat -ano | findstr ":3000" | findstr "LISTENING" && (
    echo Port 3000 is now occupied by Corporate Card
) || (
    echo Port 3000 is not listening
)

echo.
echo 8. Opening dashboard...
echo Dashboard: http://localhost:3000
echo API: http://127.0.0.1:8000
echo.
start http://localhost:3000
pause