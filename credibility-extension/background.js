// VerifiAI Scanner Background Service Worker

console.log('🔧 VerifiAI Scanner background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('✅ VerifiAI Scanner installed successfully');
    
    // Set default state
    chrome.storage.local.set({
        scanningEnabled: false
    });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Background received message:', request);
    
    if (request.action === 'analysis_complete') {
        console.log('🎯 Analysis completed for:', sender.tab?.url);
        sendResponse({success: true});
    }
    
    return true;
});