/* ───── Content Forge Chrome Extension — Background Service Worker ───── */

// Default server URL
const DEFAULT_SERVER = 'http://localhost:3001';

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    cf_server: DEFAULT_SERVER,
    cf_stats: { posts: 0, profiles: 0 },
    cf_pro: false,
  });
  console.log('Content Forge Scraper installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'check_pro') {
    chrome.storage.local.get(['cf_pro'], (result) => {
      sendResponse({ isPro: result.cf_pro || false });
    });
    return true;
  }

  if (message.action === 'set_server') {
    chrome.storage.local.set({ cf_server: message.url });
    sendResponse({ ok: true });
    return true;
  }
});
