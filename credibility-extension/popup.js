document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusMessage = document.getElementById('statusMessage');
    const statusIndicator = document.getElementById('statusIndicator');
    const goToWebsiteButton = document.getElementById('goToWebsite');
    
    console.log('🎛️ VerifiAI Scanner popup loaded');
    
    loadToggleState();
    
    toggleSwitch.addEventListener('change', function() {
        const isEnabled = toggleSwitch.checked;
        console.log('🔄 Toggle changed:', isEnabled);
        
        saveToggleState(isEnabled);
        updateStatusUI(isEnabled);
        sendCommandToContentScript(isEnabled);
    });
    
    goToWebsiteButton.addEventListener('click', function() {
        openVerifiAIWebsite();
    });
    
    function openVerifiAIWebsite() {
        const websiteUrl = 'http://localhost:3000';
        
        chrome.tabs.create({
            url: websiteUrl,
            active: true
        }, function(tab) {
            if (chrome.runtime.lastError) {
                console.error('Failed to open website:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ VerifiAI website opened');
                window.close();
            }
        });
    }
    
    function loadToggleState() {
        chrome.storage.local.get(['scanningEnabled'], function(result) {
            const isEnabled = result.scanningEnabled || false;
            console.log('📖 Loaded state:', isEnabled);
            toggleSwitch.checked = isEnabled;
            updateStatusUI(isEnabled);
        });
    }
    
    function saveToggleState(isEnabled) {
        chrome.storage.local.set({
            scanningEnabled: isEnabled
        }, function() {
            console.log('💾 State saved:', isEnabled);
        });
    }
    
    function updateStatusUI(isEnabled) {
        if (isEnabled) {
            statusMessage.textContent = 'Actively scanning for misinformation';
            statusMessage.className = 'status-message active';
            statusIndicator.className = 'status-indicator active';
        } else {
            statusMessage.textContent = 'Click toggle to activate scanning';
            statusMessage.className = 'status-message inactive';
            statusIndicator.className = 'status-indicator';
        }
    }
    
    function sendCommandToContentScript(isEnabled) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                const message = {
                    action: isEnabled ? 'activate' : 'deactivate',
                    enabled: isEnabled
                };
                
                console.log('📤 Sending message to content script:', message);
                
                chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
                    if (chrome.runtime.lastError) {
                        console.log('⚠️ Content script not ready, injecting...');
                        if (isEnabled) {
                            injectContentScript(tabs[0].id);
                        }
                    } else {
                        console.log('✅ Content script responded:', response);
                    }
                });
            }
        });
    }
    
    function injectContentScript(tabId) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content.js']
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('❌ Failed to inject content script:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Content script injected successfully');
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, {
                        action: 'activate',
                        enabled: true
                    });
                }, 500);
            }
        });
    }
});