@echo off
echo Starting VerifiAI Gemini Backend Server...
echo.
cd /d "C:\Users\prakr\OneDrive\Desktop\GenAI2\credibility-extension"
echo Current directory: %CD%
echo.
echo Starting server on port 3000...
node gemini-backend.js
pause