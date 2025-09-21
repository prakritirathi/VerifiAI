const express = require('express');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/v1/analyze', (req, res) => {
    const { content, url } = req.body;
    
    console.log('🔍 Analyzing content:', content ? content.substring(0, 100) + '...' : 'No content');
    
    if (!content) {
        return res.status(400).json({ error: 'Content required' });
    }

    const suspiciousKeywords = [
        'conspiracy', 'secret', 'government hiding', 'they don\'t want you to know',
        'miracle cure', 'doctors hate', 'big pharma', 'mind control',
        '5g', 'chemtrails', 'flat earth', 'fake moon landing',
        'bleach', 'cure cancer', 'immortality', 'aliens'
    ];
    
    const lowerContent = content.toLowerCase();
    let suspiciousCount = 0;
    let detectedKeywords = [];
    
    suspiciousKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) {
            suspiciousCount++;
            detectedKeywords.push(keyword);
        }
    });
    
    let credibilityScore = 100 - (suspiciousCount * 20);
    credibilityScore = Math.max(0, Math.min(100, credibilityScore));
    
    let riskLevel = 'LOW';
    if (credibilityScore < 30) riskLevel = 'HIGH';
    else if (credibilityScore < 60) riskLevel = 'MEDIUM';
    
    function getIssueTypes(text) {
        const issues = [];
        
        if (text.includes('satire') || text.includes('onion') || text.includes('parody')) {
            issues.push({ type: 'SATIRE', confidence: 'High' });
        }
        
        if (text.includes('conspiracy') || text.includes('secret') || text.includes('fake') || 
            text.includes('flat earth') || text.includes('aliens')) {
            issues.push({ type: 'FAKE', confidence: 'High' });
        }
        
        if (text.includes('miracle cure') || text.includes('doctors hate') || 
            text.includes('get rich quick') || text.includes('one weird trick')) {
            issues.push({ type: 'SCAM', confidence: 'High' });
        }
        
        if (text.includes('ai generated') || text.includes('deepfake') || 
            text.includes('artificial intelligence') || text.includes('synthetic')) {
            issues.push({ type: 'AI GENERATED', confidence: 'Medium' });
        }
        
        if (issues.length === 0 && suspiciousCount > 0) {
            issues.push({ type: 'FAKE', confidence: 'Medium' });
        }
        
        return issues;
    }
    
    const response = {
        credibilityScore,
        riskLevel,
        detectedKeywords,
        issueTypes: getIssueTypes(lowerContent),
        reasoning: suspiciousCount > 0 ? 
            `Found ${suspiciousCount} suspicious keywords: ${detectedKeywords.join(', ')}` :
            'No obvious red flags detected',
        timestamp: new Date().toISOString()
    };
    
    console.log('✅ Analysis result:', { 
        score: credibilityScore, 
        risk: riskLevel, 
        keywords: detectedKeywords.length,
        issues: response.issueTypes.length 
    });
    
    res.json(response);
});

app.get('/', (req, res) => {
    res.json({
        name: 'VerifiAI Test Backend',
        status: 'running',
        endpoints: ['/api/v1/health', '/api/v1/analyze']
    });
});

app.listen(port, () => {
    console.log(`
🚀 VerifiAI Test Backend Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:${PORT}
🎯 Test: http://localhost:${PORT}/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ready for extension testing!
`);
});