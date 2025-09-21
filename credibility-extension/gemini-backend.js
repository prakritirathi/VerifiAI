const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3001;

const genAI = new GoogleGenerativeAI('AIzaSyCUkYWaI6-cOBcz2tHl_WAwiB3EpUF3l7c');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

async function analyzeContentWithGemini(content, url) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `You are an expert fact-checker and misinformation detector. Analyze the following content for credibility, accuracy, and potential misinformation.

Content to analyze: "${content}"
Source URL: ${url || 'Unknown'}

Please provide a JSON response with the following structure:
{
  "credibilityScore": [0-100 integer],
  "riskLevel": ["HIGH", "MEDIUM", "LOW"],
  "reasoning": "Brief explanation of the assessment",
  "redFlags": ["List of specific concerns or red flags"],
  "sourceReliability": "Assessment of the source domain/URL",
  "factCheckSummary": "Summary of fact-checking analysis"
}

Scoring guidelines:
- 0-30: HIGH RISK - Clear misinformation, conspiracy theories, unverified claims
- 31-60: MEDIUM RISK - Questionable sources, biased content, incomplete information  
- 61-100: LOW RISK - Credible sources, verifiable information, balanced reporting

Focus on identifying:
- False or misleading claims
- Lack of credible sources
- Emotional manipulation
- Conspiracy theories
- Unverified medical/health claims
- Financial scams
- Political propaganda

Respond only with valid JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        try {
            const analysis = JSON.parse(text);
            return analysis;
        } catch (parseError) {
            console.warn('Failed to parse Gemini response as JSON:', text);
            return {
                credibilityScore: 50,
                riskLevel: 'MEDIUM',
                reasoning: 'AI analysis completed but response format was unexpected',
                redFlags: ['Unable to parse detailed analysis'],
                sourceReliability: 'Unknown',
                factCheckSummary: 'Content requires manual verification'
            };
        }
        
    } catch (error) {
        console.error('Gemini analysis error:', error);
        throw error;
    }
}

app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'VerifiAI Gemini Backend',
        aiModel: 'gemini-1.5-flash'
    });
});

app.post('/api/v1/analyze', async (req, res) => {
    const { url, content } = req.body;
    
    console.log('🔍 Analysis request received for:', url?.substring(0, 50) || 'No URL');
    console.log('📄 Content length:', content?.length || 0, 'characters');
    
    if (!content || content.trim().length < 10) {
        return res.status(400).json({
            error: 'Content is required and must be at least 10 characters long'
        });
    }
    
    try {
        console.log('🤖 Analyzing with Gemini AI...');
        const geminiAnalysis = await analyzeContentWithGemini(content, url);
        
        const response = {
            credibilityScore: geminiAnalysis.credibilityScore,
            riskLevel: geminiAnalysis.riskLevel,
            aiAnalysis: {
                reasoning: geminiAnalysis.reasoning,
                redFlags: geminiAnalysis.redFlags || [],
                sourceReliability: geminiAnalysis.sourceReliability,
                factCheckSummary: geminiAnalysis.factCheckSummary
            },
            sourceAnalysis: {
                domainAuthority: geminiAnalysis.credibilityScore > 70 ? 'High' : 
                               geminiAnalysis.credibilityScore > 40 ? 'Medium' : 'Low',
                publishDate: new Date().toISOString().split('T')[0],
                authorVerified: geminiAnalysis.credibilityScore > 60,
                sourceType: 'Web Content',
                reliabilityScore: geminiAnalysis.credibilityScore
            },
            scamIndicators: geminiAnalysis.riskLevel === 'HIGH' ? [
                {
                    type: 'ai_detected',
                    severity: 'High',
                    title: 'AI Detected Misinformation',
                    description: geminiAnalysis.reasoning
                }
            ] : [],
            metadata: {
                aiModel: 'gemini-1.5-flash',
                analysisTimestamp: new Date().toISOString(),
                contentLength: content.length,
                sourceUrl: url
            }
        };
        
        console.log('✅ Gemini analysis complete:', {
            score: response.credibilityScore,
            risk: response.riskLevel
        });
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        
        res.json({
            credibilityScore: 50,
            riskLevel: 'MEDIUM',
            aiAnalysis: {
                reasoning: 'AI analysis temporarily unavailable',
                redFlags: ['Analysis service error'],
                sourceReliability: 'Unable to determine',
                factCheckSummary: 'Please verify content manually'
            },
            sourceAnalysis: {
                domainAuthority: 'Unknown',
                publishDate: new Date().toISOString().split('T')[0],
                authorVerified: false,
                sourceType: 'Web Content',
                reliabilityScore: 50
            },
            scamIndicators: [{
                type: 'system_error',
                severity: 'Medium',
                title: 'Analysis Service Error',
                description: 'Unable to complete AI analysis. Please try again.'
            }],
            metadata: {
                aiModel: 'gemini-1.5-flash',
                analysisTimestamp: new Date().toISOString(),
                contentLength: content?.length || 0,
                sourceUrl: url,
                error: 'AI analysis failed'
            }
        });
    }
});

app.post('/api/v1/chat', async (req, res) => {
    const { message, context } = req.body;
    
    console.log('💬 Chat request received:', message?.substring(0, 50) || 'Empty message');
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `You are VerifiAI Assistant, an expert in fact-checking, media literacy, and misinformation detection. You help users understand credibility analysis results and provide guidance on identifying reliable information.

User question: "${message}"
Context: ${context || 'General fact-checking inquiry'}

Please provide a helpful, accurate, and concise response (under 200 words) that:
- Addresses the user's specific question
- Provides practical advice for fact-checking
- Explains credibility concepts clearly
- Encourages critical thinking
- Maintains a helpful and educational tone

Focus on topics like:
- How to evaluate source credibility
- Red flags for misinformation
- Fact-checking techniques
- Media literacy skills
- Understanding bias in information
- Verification methods`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();
        
        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
            conversationId: 'gemini_conv_' + Date.now(),
            aiModel: 'gemini-1.5-flash'
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        
        res.json({
            response: "I'm VerifiAI Assistant! I help with fact-checking and credibility analysis. Due to a temporary issue, I can't provide a detailed response right now, but I'm here to help you verify information and understand misinformation patterns.",
            timestamp: new Date().toISOString(),
            conversationId: 'fallback_conv_' + Date.now(),
            error: 'AI chat temporarily unavailable'
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        name: 'VerifiAI Gemini Backend',
        status: 'running',
        aiModel: 'gemini-1.5-flash',
        endpoints: {
            health: '/api/v1/health',
            analyze: '/api/v1/analyze',
            chat: '/api/v1/chat'
        },
        features: [
            'Real-time content analysis with Gemini AI',
            'Misinformation detection',
            'Source credibility assessment', 
            'Interactive fact-checking chat',
            'Red flag identification'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`
🚀 VerifiAI Gemini Backend Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI Model: gemini-1.5-flash
📍 Server: http://localhost:${PORT}
🎯 Analyze: http://localhost:${PORT}/api/v1/analyze
💬 Chat: http://localhost:${PORT}/api/v1/chat
💊 Health: http://localhost:${PORT}/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Ready to analyze content with Gemini AI!
`);
});