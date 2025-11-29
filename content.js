(function() {
    chrome.storage.sync.get([Config.STORAGE_KEY], (data) => {
        const cooldownDuration = data[Config.STORAGE_KEY] ? parseInt(data[Config.STORAGE_KEY]) : Config.DEFAULT_DURATION;
        
        initExtension(cooldownDuration);
    });

    function initExtension(cooldownDuration) {
        const host = document.createElement('div');
        host.id = 'social-pause-host';
        document.documentElement.appendChild(host);
    
        const shadow = host.attachShadow({ mode: 'closed' });
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('styles.css');
        shadow.appendChild(link);
    
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
    
        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'timer';
        timerDisplay.innerText = cooldownDuration;
    
        const enterBtn = document.createElement('button');
        enterBtn.id = 'enter-btn';
        enterBtn.innerText = "Wait...";
        enterBtn.disabled = true;
    
        overlay.appendChild(timerDisplay);
        overlay.appendChild(enterBtn);
        shadow.appendChild(overlay);
    
        let timeLeft = cooldownDuration;
    
        const interval = setInterval(() => {
            if (document.hidden) {
                enterBtn.innerText = "Focus to continue"; 
                return; 
            }
            
            timeLeft--;
            timerDisplay.innerText = timeLeft;
    
            if (timeLeft <= 0) {
                clearInterval(interval);
                
                enterBtn.classList.add('active');
                enterBtn.disabled = false;
                enterBtn.innerText = "Enter Site";
    
                enterBtn.addEventListener('click', () => {
                    overlay.style.transition = "opacity 0.5s ease";
                    overlay.style.opacity = "0";
                    setTimeout(() => {
                        host.remove(); 
                    }, 500);
                });
            }
        }, 1000);
    }
})();