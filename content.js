(function() {
    chrome.storage.sync.get([Config.TIMER_DURATION_KEY, Config.ROOT_ONLY_KEY], (data) => {
        const cooldownDuration = data[Config.TIMER_DURATION_KEY] ? parseInt(data[Config.TIMER_DURATION_KEY]) : Config.DEFAULT_DURATION;
        const rootOnly = data[Config.ROOT_ONLY_KEY] !== undefined ? data[Config.ROOT_ONLY_KEY] : Config.DEFAULT_ROOT_ONLY;
        
        initExtension(cooldownDuration, rootOnly);
    });

    function initExtension(cooldownDuration, rootOnly) {
        if (rootOnly) {
            const isRoot = Config.FEED_PATHS.includes(window.location.pathname);
            if (!isRoot) {
                return;
            }
        }

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