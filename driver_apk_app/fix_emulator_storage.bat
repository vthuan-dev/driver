@echo off
echo ========================================
echo   XOA DATA EMULATOR - GIAI PHONG BO NHO
echo ========================================
echo.
echo Dang xoa data cua emulator...
echo.

REM Xoa data emulator
adb -s emulator-5554 shell pm clear com.android.vending
adb -s emulator-5554 shell pm clear com.google.android.gms

echo.
echo Xoa cache...
adb -s emulator-5554 shell pm trim-caches 1000M

echo.
echo Done! Thu chay lai app.
pause