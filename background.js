async function updateBlockingRules(domains) {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: ["friction-script"] });
  } catch (err) {

  }
  if (!domains || domains.length === 0) return;
  const matchPatterns = domains.map(domain => `*://*.${domain}/*`);
  await chrome.scripting.registerContentScripts([{
    id: "friction-script",
    matches: matchPatterns,
    js: ["config.js", "content.js"],
    runAt: "document_start"
  }]);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockedSites) {
    updateBlockingRules(changes.blockedSites.newValue);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.sync.get("blockedSites");
  if (data.blockedSites) {
    updateBlockingRules(data.blockedSites);
  }
});

const DEFAULT_SITES = [
  "facebook.com", "twitter.com", "x.com", "instagram.com", 
  "reddit.com", "linkedin.com", "youtube.com", "tiktok.com"
];

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.sync.set({ blockedSites: DEFAULT_SITES });
    updateBlockingRules(DEFAULT_SITES);
  } else {
    const data = await chrome.storage.sync.get("blockedSites");
    if (data.blockedSites) {
      updateBlockingRules(data.blockedSites);
    }
  }
});