@echo off
cd /d "%~dp0.."
copy /Y "config\vercel.json" "vercel.json" >nul
echo Da tao vercel.json o thu muc goc de trien khai Vercel.
