document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get([Config.TIMER_DURATION_KEY, Config.ROOT_ONLY_KEY], (result) => {
        const duration = result[Config.TIMER_DURATION_KEY] || Config.DEFAULT_DURATION;
        document.getElementById('seconds').value = duration;
    });
    
    const domainDisplay = document.getElementById('domain-display');
    const toggleBtn = document.getElementById('toggle-site-btn');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        
        if (!currentTab.url || currentTab.url.startsWith('chrome://')) {
            domainDisplay.textContent = "System Page";
            toggleBtn.disabled = true;
            toggleBtn.textContent = "Cannot Block";
            return;
        }

        const domain = getDomainFromUrl(currentTab.url);
        domainDisplay.textContent = domain;
        chrome.storage.sync.get(['blockedSites'], (data) => {
            const sites = data.blockedSites || [];
            const isBlocked = sites.includes(domain);
        
            updateButtonUI(isBlocked);
            toggleBtn.onclick = () => {
                isBlocked ? removeSite(domain, sites) : addSite(domain, sites);
            };
        });
    });

    const rootOnlyCheckbox = document.getElementById('root-only');
    rootOnlyCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ rootOnly: rootOnlyCheckbox.checked });
    });
    chrome.storage.sync.get([Config.ROOT_ONLY_KEY], (result) => {
        rootOnlyCheckbox.checked = result[Config.ROOT_ONLY_KEY] || Config.DEFAULT_ROOT_ONLY;
    });

    function updateButtonUI(isBlocked) {
        if (isBlocked) {
            toggleBtn.textContent = "remove friction";
            toggleBtn.className = "btn-action btn-remove";
        } else {
            toggleBtn.textContent = "add friction";
            toggleBtn.className = "btn-action btn-add";
        }
    }

    function addSite(domain, currentList) {
        currentList.push(domain);
        saveAndReload(currentList);
    }

    function removeSite(domain, currentList) {
        const newList = currentList.filter(site => site !== domain);
        saveAndReload(newList);
    }

    function saveAndReload(newList) {
        chrome.storage.sync.set({ blockedSites: newList }, () => {
            chrome.tabs.reload(); 
            window.close();
        });
    }

    function getDomainFromUrl(url) {
        try {
            const urlObj = new URL(url);
            let hostname = urlObj.hostname;
            return hostname.replace(/^www\./, '');
        } catch (e) {
            return url;
        }
    }
});

document.getElementById('save').addEventListener('click', () => {
    const seconds = document.getElementById('seconds').value;

    chrome.storage.sync.set({ [Config.STORAGE_KEY]: seconds }, () => {
        statusMessage();
    });
});

function statusMessage() {
    const status = document.getElementById('status');
    status.textContent = 'saved.';
    setTimeout(() => {
        status.textContent = '';
    }, 1500);
}
