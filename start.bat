@echo off
title Tinh Tam Thien Duong - OBS Overlay
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js chua duoc cai. Cai Node.js roi mo lai file nay.
  pause
  exit /b 1
)
echo =============================================
echo TINH TAM THIEN DUONG - OBS
echo OBS Browser Source: http://localhost:3000/obs
echo Bang dieu khien:  http://localhost:3000/admin.html
echo =============================================
curl.exe -fsS -o nul http://127.0.0.1:3000/api/version >nul 2>&1
if not errorlevel 1 (
  echo Server ban moi dang chay. Ban co the dan link vao OBS ngay.
  pause
  exit /b 0
)
echo Giu cua so nay mo trong luc live.
node server.js
echo Server da dung. Nhan phim bat ky de dong cua so.
pause >nul
