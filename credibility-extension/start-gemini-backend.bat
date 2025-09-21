@echo off
echo.
echo ===================================
echo   VerifiAI Gemini Backend Server
echo ===================================
echo.
cd /d "C:\Users\prakr\OneDrive\Desktop\GenAI2\credibility-extension"
echo Starting Gemini backend on port 3001...
echo.
node gemini-backend.js
echo.
echo Press any key to close...
pause > nul