// Quick test to verify Gemini backend
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

// Initialize Gemini AI with the same API key
const genAI = new GoogleGenerativeAI('AIzaSyCUkYWaI6-cOBcz2tHl_WAwiB3EpUF3l7c');

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/v1/health', (req, res) => {
    console.log('🔍 Health check requested');
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'VerifiAI Gemini Backend',
        aiModel: 'gemini-1.5-flash',
        message: 'Backend is running and ready!'
    });
});

// Quick test endpoint
app.post('/api/v1/test', async (req, res) => {
    try {
        console.log('🤖 Testing Gemini API...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'Hello from Gemini API!' in one sentence.");
        const response = await result.response;
        const text = response.text();
        
        res.json({
            success: true,
            message: 'Gemini API is working!',
            geminiResponse: text,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Gemini API test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Gemini API test failed'
        });
    }
});

app.listen(PORT, () => {
    console.log('🚀 VerifiAI Gemini Backend started!');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log('🤖 Gemini AI integration: READY');
    console.log('');
    console.log('Available endpoints:');
    console.log(`   GET  http://localhost:${PORT}/api/v1/health`);
    console.log(`   POST http://localhost:${PORT}/api/v1/test`);
    console.log('');
    console.log('🎯 Ready for extension and website testing!');
});