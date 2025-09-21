// Simple test backend for VerifiAI website integration
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all origins (for testing)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health endpoint
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'VerifiAI Test Backend'
    });
});

// Analysis endpoint
app.post('/api/v1/analyze', (req, res) => {
    const { url, content } = req.body;
    
    console.log('🔍 Analysis request received:', { url: url?.substring(0, 50) });
    
    // Simulate AI analysis with realistic data
    const credibilityScore = Math.floor(Math.random() * 100);
    const riskLevel = credibilityScore > 70 ? 'LOW' : credibilityScore > 40 ? 'MEDIUM' : 'HIGH';
    
    const response = {
        credibilityScore,
        riskLevel,
        sourceAnalysis: {
            domainAuthority: credibilityScore > 70 ? 'High' : credibilityScore > 40 ? 'Medium' : 'Low',
            publishDate: new Date().toISOString().split('T')[0],
            authorVerified: credibilityScore > 60,
            sourceType: 'News Article',
            reliabilityScore: credibilityScore
        },
        crossReferences: [
            {
                source: 'Reuters',
                matchType: 'Partial',
                summary: 'Similar content found with verification from reliable source',
                date: '2025-09-20',
                credibility: credibilityScore > 50 ? 85 : 45
            },
            {
                source: 'BBC News',
                matchType: credibilityScore > 60 ? 'Full' : 'Conflicting',
                summary: 'Cross-reference analysis reveals fact-checking results',
                date: '2025-09-20',
                credibility: credibilityScore > 50 ? 90 : 40
            }
        ],
        scamIndicators: riskLevel === 'HIGH' ? [
            {
                type: 'suspicious',
                severity: 'High',
                title: 'Unverified Claims',
                description: 'Content contains claims that could not be verified through reliable sources'
            }
        ] : [],
        mediaAnalysis: {
            imageManipulation: riskLevel === 'HIGH',
            reverseImageMatches: Math.floor(Math.random() * 10),
            deepfakeDetected: false,
            audioAuthentic: true
        },
        timestamp: new Date().toISOString()
    };
    
    res.json(response);
});

// Chat endpoint
app.post('/api/v1/chat', (req, res) => {
    const { message, context } = req.body;
    
    console.log('💬 Chat request received:', message.substring(0, 50));
    
    // Simple response generation based on keywords
    let response = "I'm VerifiAI Assistant! I help explain content analysis and fact-checking.";
    
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
        response = "VerifiAI analyzes content using AI to check source credibility, cross-reference facts, and identify potential misinformation patterns. The system scores content from 0-100 based on multiple reliability factors.";
    } else if (lowerMessage.includes('risk') || lowerMessage.includes('red')) {
        response = "High-risk content (shown in red) indicates potential misinformation or unreliable sources. Always verify important information through multiple reliable sources before sharing.";
    } else if (lowerMessage.includes('green') || lowerMessage.includes('safe')) {
        response = "Green indicates content from reliable sources with good credibility scores. However, always maintain critical thinking!";
    } else if (lowerMessage.includes('score') || lowerMessage.includes('credibility')) {
        response = "The credibility score (0-100) is calculated based on source authority, content verification, cross-references, and AI analysis of potential misinformation patterns.";
    }
    
    res.json({
        response,
        timestamp: new Date().toISOString(),
        conversationId: 'test_conv_' + Date.now()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'VerifiAI Test Backend',
        status: 'running',
        endpoints: {
            health: '/api/v1/health',
            analyze: '/api/v1/analyze',
            chat: '/api/v1/chat'
        }
    });
});

app.listen(PORT, () => {
    console.log(`
🚀 VerifiAI Test Backend Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:${PORT}
🎯 Analyze: http://localhost:${PORT}/api/v1/analyze
💬 Chat: http://localhost:${PORT}/api/v1/chat
💊 Health: http://localhost:${PORT}/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});