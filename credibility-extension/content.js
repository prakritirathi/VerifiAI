

(function() {
    'use strict';
    
    console.log('VerifiAI Scanner content script loading...');
    
    const CONFIG = {
        API_URL: 'http://localhost:3000/api/v1/analyze',
        MIN_TEXT_LENGTH: 30,
        MAX_ANALYSIS_ITEMS: 15,
        HIGHLIGHT_CLASSES: {
            base: 'verifiai-highlight',
            high: 'verifiai-highlight-high',
            medium: 'verifiai-highlight-medium',
            low: 'verifiai-highlight-low'
        }
    };
    
    let isActive = false;
    let analysisInProgress = false;
    
    function injectStyles() {
        if (document.getElementById('verifiai-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'verifiai-styles';
        style.textContent = `
            .${CONFIG.HIGHLIGHT_CLASSES.base} {
                background: linear-gradient(120deg, rgba(255, 193, 7, 0.3) 0%, rgba(255, 152, 0, 0.3) 100%);
                border-radius: 3px;
                padding: 2px 4px;
                margin: 0 1px;
                cursor: pointer;
                transition: all 0.3s ease;
                border-bottom: 2px solid rgba(255, 193, 7, 0.6);
                position: relative;
            }
            
            .${CONFIG.HIGHLIGHT_CLASSES.high} {
                background: linear-gradient(120deg, rgba(244, 67, 54, 0.3) 0%, rgba(183, 28, 28, 0.3) 100%);
                border-bottom: 2px solid rgba(244, 67, 54, 0.8);
                animation: pulse-red 2s infinite;
            }
            
            .${CONFIG.HIGHLIGHT_CLASSES.medium} {
                background: linear-gradient(120deg, rgba(255, 152, 0, 0.3) 0%, rgba(245, 124, 0, 0.3) 100%);
                border-bottom: 2px solid rgba(255, 152, 0, 0.8);
            }
            
            .${CONFIG.HIGHLIGHT_CLASSES.low} {
                background: linear-gradient(120deg, rgba(255, 235, 59, 0.3) 0%, rgba(255, 193, 7, 0.3) 100%);
                border-bottom: 2px solid rgba(255, 235, 59, 0.8);
            }
            
            .${CONFIG.HIGHLIGHT_CLASSES.base}:hover {
                transform: scale(1.02);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                z-index: 10;
                position: relative;
            }
            
            .${CONFIG.HIGHLIGHT_CLASSES.base}::before {
                content: '⚠️';
                position: absolute;
                left: -15px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .${CONFIG.HIGHLIGHT_CLASSES.base}:hover::before {
                opacity: 1;
            }
            
            @keyframes pulse-red {
                0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
                70% { box-shadow: 0 0 0 8px rgba(244, 67, 54, 0); }
                100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
            }
            
            .verifiai-tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                max-width: 300px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .verifiai-tooltip.show {
                opacity: 1;
            }
        `;
        
        document.head.appendChild(style);
        console.log(' Styles injected');
    }
    
    // AI Analysis function
    async function analyzeText(text) {
        try {
            console.log(' Analyzing text:', text.substring(0, 50) + '...');
            
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: text,
                    url: window.location.href
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();
            console.log(' Analysis result:', result);
            return result;
            
        } catch (error) {
            console.warn(' Analysis failed:', error.message);
            return null;
        }
    }
    
    // Get risk class based on credibility score
    function getRiskClass(score) {
        if (score < 30) return CONFIG.HIGHLIGHT_CLASSES.high;
        if (score < 50) return CONFIG.HIGHLIGHT_CLASSES.medium;
        if (score < 70) return CONFIG.HIGHLIGHT_CLASSES.low;
        return null; 
    }
    
    // Create tooltip
    function createTooltip(element, analysis) {
        const tooltip = document.createElement('div');
        tooltip.className = 'verifiai-tooltip';
        tooltip.innerHTML = `
            <strong>Credibility Score: ${analysis.credibilityScore}%</strong><br>
            Risk Level: ${analysis.riskLevel}<br>
            <small>Click for detailed analysis</small>
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
        
        setTimeout(() => tooltip.classList.add('show'), 100);
        
        return tooltip;
    }
    
    // Highlight text with analysis result
    function highlightText(textNode, analysis) {
        const parent = textNode.parentNode;
        if (!parent || parent.classList.contains(CONFIG.HIGHLIGHT_CLASSES.base)) {
            return; 
        }
        
        const riskClass = getRiskClass(analysis.credibilityScore);
        if (!riskClass) {
            return; // Content is credible, don't highlight
        }
        
        console.log(`🎯 Highlighting text (Score: ${analysis.credibilityScore}%, Risk: ${analysis.riskLevel})`);
        
        const highlight = document.createElement('span');
        highlight.className = `${CONFIG.HIGHLIGHT_CLASSES.base} ${riskClass}`;
        highlight.textContent = textNode.textContent;
        highlight.setAttribute('data-score', analysis.credibilityScore);
        highlight.setAttribute('data-risk', analysis.riskLevel);
        
        // Add issue types to analysis if not present
        if (!analysis.issueTypes) {
            analysis.issueTypes = getIssueTypes(textNode.textContent);
        }
        
        let tooltip = null;
        
        // Mouse events for tooltip
        highlight.addEventListener('mouseenter', () => {
            tooltip = createTooltip(highlight, analysis);
        });
        
        highlight.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
        
        // Click event for detailed analysis
        highlight.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔍 Detailed analysis requested for:', analysis);
            showCustomPopup(analysis, textNode.textContent);
        });
        
        parent.replaceChild(highlight, textNode);
    }
    
    // Get issue types based on content analysis
    function getIssueTypes(text) {
        const lowerText = text.toLowerCase();
        const issues = [];
        
        // Satire detection
        if (lowerText.includes('onion') || lowerText.includes('satirical') || lowerText.includes('parody')) {
            issues.push({ type: 'SATIRE', confidence: 'High' });
        }
        
        // Fake news detection
        if (lowerText.includes('fake') || lowerText.includes('hoax') || lowerText.includes('conspiracy') || 
            lowerText.includes('secret') || lowerText.includes('cover-up')) {
            issues.push({ type: 'FAKE', confidence: 'High' });
        }
        
        // Scam detection
        if (lowerText.includes('get rich quick') || lowerText.includes('miracle cure') || 
            lowerText.includes('doctors hate') || lowerText.includes('one weird trick') ||
            lowerText.includes('make money fast')) {
            issues.push({ type: 'SCAM', confidence: 'High' });
        }
        
        // AI generated detection
        if (lowerText.includes('ai generated') || lowerText.includes('artificial intelligence') ||
            lowerText.includes('deepfake') || lowerText.includes('synthetic')) {
            issues.push({ type: 'AI GENERATED', confidence: 'Medium' });
        }
        
        // Misinformation detection (general)
        if (lowerText.includes('government hiding') || lowerText.includes('they don\'t want you to know') ||
            lowerText.includes('mind control') || lowerText.includes('chemtrails') ||
            lowerText.includes('flat earth') || lowerText.includes('aliens')) {
            issues.push({ type: 'FAKE', confidence: 'High' });
        }
        
        // Medical misinformation
        if (lowerText.includes('cure cancer') || lowerText.includes('bleach') ||
            lowerText.includes('vaccine') && (lowerText.includes('dangerous') || lowerText.includes('poison'))) {
            issues.push({ type: 'FAKE', confidence: 'High' });
        }
        
        // Default if no specific type detected but content is suspicious
        if (issues.length === 0) {
            issues.push({ type: 'FAKE', confidence: 'Medium' });
        }
        
        return issues;
    }
    
    // Create custom popup modal
    function showCustomPopup(analysis, content) {
        // Remove any existing popup
        const existingPopup = document.getElementById('verifiai-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.id = 'verifiai-popup';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Create popup content
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        // Get issues or create default
        const issues = analysis.issueTypes || getIssueTypes(content);
        
        // Create issue tags HTML
        const issueTagsHTML = issues.map(issue => {
            const colors = {
                'SATIRE': { bg: '#FFF3CD', border: '#F0AD4E', text: '#856404' },
                'FAKE': { bg: '#F8D7DA', border: '#DC3545', text: '#721C24' },
                'SCAM': { bg: '#FFE4E1', border: '#FF6B6B', text: '#8B0000' },
                'AI GENERATED': { bg: '#E1F5FE', border: '#29B6F6', text: '#0D47A1' }
            };
            
            const color = colors[issue.type] || colors['FAKE'];
            
            return `
                <span style="
                    display: inline-block;
                    background: ${color.bg};
                    border: 1px solid ${color.border};
                    color: ${color.text};
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    margin: 2px;
                    text-transform: uppercase;
                ">
                    ${issue.type}
                </span>
            `;
        }).join('');
        
        popup.innerHTML = `
            <div style="padding: 24px;">
                <!-- Header -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 18px;
                        ">V</div>
                        <div>
                            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">VerifiAI Analysis</h3>
                            <p style="margin: 0; color: #666; font-size: 14px;">Content Credibility Assessment</p>
                        </div>
                    </div>
                    <button id="verifiai-close" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        color: #666;
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 4px;
                        line-height: 1;
                    ">×</button>
                </div>
                
                <!-- Credibility Score -->
                <div style="
                    background: ${analysis.credibilityScore < 30 ? '#FFF5F5' : analysis.credibilityScore < 60 ? '#FFFBF0' : '#F0FFF4'};
                    border: 1px solid ${analysis.credibilityScore < 30 ? '#FEB2B2' : analysis.credibilityScore < 60 ? '#FBD38D' : '#9AE6B4'};
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                ">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: #1a1a1a;">Credibility Score</span>
                        <span style="
                            font-size: 24px;
                            font-weight: bold;
                            color: ${analysis.credibilityScore < 30 ? '#E53E3E' : analysis.credibilityScore < 60 ? '#DD6B20' : '#38A169'};
                        ">${analysis.credibilityScore}%</span>
                    </div>
                    <div style="
                        background: #E2E8F0;
                        border-radius: 10px;
                        height: 8px;
                        overflow: hidden;
                    ">
                        <div style="
                            background: ${analysis.credibilityScore < 30 ? '#E53E3E' : analysis.credibilityScore < 60 ? '#DD6B20' : '#38A169'};
                            height: 100%;
                            width: ${analysis.credibilityScore}%;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>
                
                <!-- Issues Detected -->
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Issues Detected</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${issueTagsHTML}
                    </div>
                </div>
                
                <!-- Content Preview -->
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #4A5568;">Flagged Content</h4>
                    <div style="
                        background: #F7FAFC;
                        border-left: 4px solid #667eea;
                        padding: 12px;
                        border-radius: 4px;
                        font-size: 14px;
                        color: #2D3748;
                        max-height: 100px;
                        overflow-y: auto;
                        line-height: 1.4;
                    ">
                        "${content.length > 200 ? content.substring(0, 200) + '...' : content}"
                    </div>
                </div>
                
                <!-- Risk Level -->
                <div style="margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 600; color: #4A5568;">Risk Level:</span>
                        <span style="
                            background: ${analysis.riskLevel === 'HIGH' ? '#FEB2B2' : analysis.riskLevel === 'MEDIUM' ? '#FBD38D' : '#9AE6B4'};
                            color: ${analysis.riskLevel === 'HIGH' ? '#9B2C2C' : analysis.riskLevel === 'MEDIUM' ? '#B7791F' : '#276749'};
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 600;
                        ">${analysis.riskLevel}</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="verifiai-learn-more" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s ease;
                    ">Learn More</button>
                    <button id="verifiai-dismiss" style="
                        background: #E2E8F0;
                        color: #4A5568;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s ease;
                    ">Dismiss</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('verifiai-close').addEventListener('click', () => {
            overlay.remove();
        });
        
        document.getElementById('verifiai-dismiss').addEventListener('click', () => {
            overlay.remove();
        });
        
        document.getElementById('verifiai-learn-more').addEventListener('click', () => {
            window.open('http://localhost:3000', '_blank');
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    // Get text nodes from the page
    function getTextNodes() {
        const textNodes = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script, style, and already highlighted content
                    const parent = node.parentNode;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    
                    const tagName = parent.tagName?.toLowerCase();
                    if (['script', 'style', 'noscript'].includes(tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    if (parent.classList.contains(CONFIG.HIGHLIGHT_CLASSES.base)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    const text = node.textContent.trim();
                    if (text.length < CONFIG.MIN_TEXT_LENGTH) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }
    
    // Main analysis function
    async function analyzePageContent() {
        if (analysisInProgress) {
            console.log('⏳ Analysis already in progress');
            return;
        }
        
        analysisInProgress = true;
        console.log('🔍 Starting page analysis...');
        
        try {
            const textNodes = getTextNodes();
            console.log(`📊 Found ${textNodes.length} text nodes`);
            
            // Limit the number of items to analyze for performance
            const nodesToAnalyze = textNodes.slice(0, CONFIG.MAX_ANALYSIS_ITEMS);
            
            let analysisCount = 0;
            
            for (const textNode of nodesToAnalyze) {
                const text = textNode.textContent.trim();
                
                try {
                    const analysis = await analyzeText(text);
                    if (analysis && analysis.credibilityScore < 70) {
                        highlightText(textNode, analysis);
                        analysisCount++;
                    }
                    
                    // Small delay to prevent overwhelming the API
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    console.warn('⚠️ Failed to analyze text node:', error);
                }
            }
            
            console.log(`✅ Analysis complete. Highlighted ${analysisCount} suspicious items.`);
            
            // Notify background script
            chrome.runtime.sendMessage({
                action: 'analysis_complete',
                highlightCount: analysisCount
            });
            
        } catch (error) {
            console.error('❌ Page analysis failed:', error);
        } finally {
            analysisInProgress = false;
        }
    }
    
    // Clear all highlights
    function clearHighlights() {
        const highlights = document.querySelectorAll(`.${CONFIG.HIGHLIGHT_CLASSES.base}`);
        console.log(`🧹 Clearing ${highlights.length} highlights`);
        
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            const textNode = document.createTextNode(highlight.textContent);
            parent.replaceChild(textNode, highlight);
        });
        
        // Remove tooltips
        const tooltips = document.querySelectorAll('.verifiai-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }
    
    // Simplified manual highlighting for testing
    function manualHighlightTest() {
        console.log('🎯 Running manual highlight test...');
        injectStyles();
        
        // Find text nodes with suspicious keywords
        const suspiciousKeywords = ['conspiracy', 'secret', 'cure', 'government', 'bleach', 'mind control', 'aliens', 'fake'];
        const textNodes = getTextNodes();
        
        console.log(`📝 Found ${textNodes.length} text nodes to check`);
        
        let highlightCount = 0;
        
        textNodes.forEach((textNode, index) => {
            const text = textNode.textContent.toLowerCase();
            let isSuspicious = false;
            
            // Check for suspicious keywords
            for (const keyword of suspiciousKeywords) {
                if (text.includes(keyword)) {
                    isSuspicious = true;
                    break;
                }
            }
            
            if (isSuspicious && highlightCount < 5) { // Limit to 5 highlights for testing
                console.log(`🔴 Highlighting suspicious text: "${textNode.textContent.substring(0, 50)}..."`);
                
                const highlight = document.createElement('span');
                highlight.className = 'verifiai-highlight verifiai-highlight-high';
                highlight.textContent = textNode.textContent;
                highlight.style.background = 'rgba(255, 0, 0, 0.3)';
                highlight.style.border = '2px solid red';
                highlight.style.padding = '2px';
                highlight.setAttribute('data-test', 'manual-highlight');
                
                // Add click handler
                highlight.addEventListener('click', () => {
                    const mockAnalysis = {
                        credibilityScore: 25,
                        riskLevel: 'HIGH',
                        detectedKeywords: suspiciousKeywords.filter(k => text.includes(k)),
                        issueTypes: getIssueTypes(text)
                    };
                    showCustomPopup(mockAnalysis, textNode.textContent);
                });
                
                textNode.parentNode.replaceChild(highlight, textNode);
                highlightCount++;
            }
        });
        
        console.log(`✅ Manual highlighting complete. Added ${highlightCount} highlights.`);
        return highlightCount;
    }
    
    // Expose manual test function globally
    window.manualHighlightTest = manualHighlightTest;
    
    // Message listener for popup commands
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('📨 Content script received:', request);
        
        if (request.action === 'activate') {
            console.log('🟢 Activating scanner...');
            isActive = true;
            injectStyles();
            clearHighlights(); // Clear any existing highlights first
            
            // Run manual test first, then try API
            const manualCount = manualHighlightTest();
            
            if (manualCount > 0) {
                console.log('✅ Manual highlighting successful');
                sendResponse({success: true, message: `Scanner activated - ${manualCount} suspicious items found`});
            } else {
                console.log('⚠️ No suspicious content found with manual method, trying API...');
                analyzePageContent();
                sendResponse({success: true, message: 'Scanner activated - analyzing with API'});
            }
            
        } else if (request.action === 'deactivate') {
            console.log('🔴 Deactivating scanner...');
            isActive = false;
            clearHighlights();
            sendResponse({success: true, message: 'Scanner deactivated'});
        }
        
        return true;
    });
    
    // Debug function to test highlighting manually
    window.testHighlight = function() {
        console.log('🧪 Testing manual highlight...');
        injectStyles();
        
        // Create a test highlight
        const testElement = document.createElement('span');
        testElement.className = 'verifiai-highlight verifiai-highlight-high';
        testElement.textContent = 'TEST HIGHLIGHT';
        testElement.style.position = 'fixed';
        testElement.style.top = '10px';
        testElement.style.right = '10px';
        testElement.style.zIndex = '9999';
        testElement.style.padding = '10px';
        testElement.style.background = 'red';
        testElement.style.color = 'white';
        document.body.appendChild(testElement);
        
        console.log('✅ Test highlight added');
    };
    
    // Check if extension should auto-activate based on saved state
    chrome.storage.local.get(['scanningEnabled'], function(result) {
        console.log('💾 Storage check result:', result);
        if (result.scanningEnabled) {
            console.log('🔄 Auto-activating based on saved state');
            isActive = true;
            injectStyles();
            
            // Add test highlight first
            window.testHighlight();
            
            // Delay to ensure page is fully loaded
            setTimeout(() => {
                if (isActive) {
                    console.log('⏰ Starting delayed analysis...');
                    analyzePageContent();
                }
            }, 3000);
        } else {
            console.log('❌ Scanning not enabled in storage');
        }
    });
    
    console.log('✅ VerifiAI Scanner content script ready');
    
})();