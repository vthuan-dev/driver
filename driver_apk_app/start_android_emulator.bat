@echo off
echo ========================================
echo   KHOI DONG ANDROID EMULATOR
echo ========================================
echo.
echo Dang khoi dong emulator...
echo Vui long doi 30-60 giay...
echo.

REM Khoi dong emulator
start /B flutter emulators --launch Medium_Phone_API_36.0

echo.
echo Emulator dang khoi dong...
echo Doi 30 giay de emulator boot xong...
timeout /t 30 /nobreak

echo.
echo Kiem tra devices...
flutter devices

echo.
echo Nhan phim bat ky de tiep tuc...
pause