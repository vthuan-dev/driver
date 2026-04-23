@echo off
echo ========================================
echo   DRIVER APP - ANDROID (FULL)
echo ========================================
echo.
echo [1/3] Khoi dong Android Emulator...
echo.

REM Khoi dong emulator
start /B flutter emulators --launch Medium_Phone_API_36.0

echo Emulator dang khoi dong...
echo Doi 40 giay de emulator boot xong...
timeout /t 40 /nobreak

echo.
echo [2/3] Kiem tra devices...
flutter devices

echo.
echo [3/3] Chay ung dung tren emulator...
echo.
flutter run

pause