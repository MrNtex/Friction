document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get([Config.STORAGE_KEY], (result) => {
        const duration = result[Config.STORAGE_KEY] || Config.DEFAULT_DURATION;
        document.getElementById('seconds').value = duration;
    });
});

document.getElementById('save').addEventListener('click', () => {
    const seconds = document.getElementById('seconds').value;

    chrome.storage.sync.set({ [Config.STORAGE_KEY]: seconds }, () => {
        const status = document.getElementById('status');
        status.textContent = 'saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 1500);
    });
});