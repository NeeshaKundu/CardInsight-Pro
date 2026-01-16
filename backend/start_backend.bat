@echo off
cd /d C:\Users\kundu\CorporateCardAnalytics\backend
C:\Users\kundu\CorporateCardAnalytics\backend\venv\Scripts\python.exe -m uvicorn server:app --host 0.0.0.0 --port 8000
