/* ───── Content Forge Chrome Extension — Popup Logic ───── */

const PLATFORMS = {
  'tiktok.com': { name: 'TikTok', icon: '📱' },
  'instagram.com': { name: 'Instagram', icon: '📸' },
  'youtube.com': { name: 'YouTube', icon: '▶️' },
  'x.com': { name: 'X (Twitter)', icon: '𝕏' },
  'twitter.com': { name: 'X (Twitter)', icon: '𝕏' },
  'linkedin.com': { name: 'LinkedIn', icon: '💼' },
  'facebook.com': { name: 'Facebook', icon: '📘' },
  'reddit.com': { name: 'Reddit', icon: '🟠' },
  'threads.net': { name: 'Threads', icon: '🔗' },
};

// Video URL patterns that support deep breakdown
const VIDEO_PATTERNS = [
  /youtube\.com\/watch/i,
  /youtu\.be\//i,
  /youtube\.com\/shorts\//i,
  /tiktok\.com\/@[^/]+\/video/i,
  /instagram\.com\/reel\//i,
  /instagram\.com\/p\//i,
];

function isVideoUrl(url) {
  return VIDEO_PATTERNS.some(p => p.test(url));
}

let stats = { posts: 0, profiles: 0 };
let currentTabUrl = '';

// Detect current platform
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  const url = tab?.url || '';
  currentTabUrl = url;
  let detected = null;

  for (const [domain, info] of Object.entries(PLATFORMS)) {
    if (url.includes(domain)) {
      detected = { ...info, url };
      break;
    }
  }

  document.getElementById('platformIcon').textContent = detected?.icon || '🌐';
  document.getElementById('platformName').textContent = detected?.name || 'No platform detected';
  document.getElementById('platformUrl').textContent = detected ? url.substring(0, 50) + '...' : 'Navigate to a social platform';

  // Enable/disable scrape buttons
  const scrapeBtn = document.getElementById('scrapeBtn');
  const profileBtn = document.getElementById('scrapeProfile');
  if (!detected) {
    scrapeBtn.style.opacity = '0.5';
    scrapeBtn.style.pointerEvents = 'none';
    profileBtn.style.opacity = '0.5';
    profileBtn.style.pointerEvents = 'none';
  }

  // Enable breakdown button only for video URLs
  const breakdownBtn = document.getElementById('breakdownBtn');
  if (detected && isVideoUrl(url)) {
    breakdownBtn.disabled = false;
  }
});

// Load stats
chrome.storage.local.get(['cf_stats'], (result) => {
  if (result.cf_stats) {
    stats = result.cf_stats;
    document.getElementById('postsScraped').textContent = stats.posts;
    document.getElementById('profilesScraped').textContent = stats.profiles;
  }
});

// Scrape This Page
document.getElementById('scrapeBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrape_feed' }, (response) => {
      if (response?.data) {
        stats.posts += response.data.length;
        updateStats();
        sendToContentForge('feed', response.data);
        showFeedback('scrapeBtn', `✅ Scraped ${response.data.length} posts`);
      }
    });
  });
});

// 🔬 Deep Breakdown — analyze current video URL
document.getElementById('breakdownBtn').addEventListener('click', async () => {
  if (!currentTabUrl || !isVideoUrl(currentTabUrl)) return;

  const btn = document.getElementById('breakdownBtn');
  const resultDiv = document.getElementById('breakdownResult');
  const originalText = btn.textContent;

  btn.textContent = '🔬 Analyzing...';
  btn.disabled = true;
  resultDiv.textContent = '⏳ Extracting transcript & analyzing with Gemini AI...';
  resultDiv.classList.add('visible');

  try {
    const { cf_server } = await chrome.storage.local.get(['cf_server']);
    const serverUrl = cf_server || 'http://localhost:3001';

    const res = await fetch(`${serverUrl}/api/analyze/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: currentTabUrl }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Analysis failed');
    }

    const data = await res.json();

    // Show success feedback
    btn.textContent = '✅ Breakdown Ready!';
    resultDiv.innerHTML = `<strong>✅ Analysis complete!</strong><br>` +
      `📊 ${data.platform} · ${data.totalDuration}s · ${data.wordCount} words<br>` +
      `🪝 Hook: ${data.analysis?.hook?.grade || '—'} grade · ${data.analysis?.hook?.type || '—'}<br>` +
      `📐 Framework: ${data.analysis?.story_structure?.framework || '—'}<br>` +
      `<a href="${serverUrl}/research/breakdown?url=${encodeURIComponent(currentTabUrl)}" ` +
      `target="_blank" style="color:#8b5cf6;text-decoration:underline;font-weight:600;">` +
      `View Full Breakdown →</a>`;

    setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
  } catch (err) {
    btn.textContent = '❌ Failed';
    resultDiv.textContent = `❌ ${err.message}`;
    setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
  }
});

// Scrape Full Profile
document.getElementById('scrapeProfile').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrape_profile' }, (response) => {
      if (response?.data) {
        stats.profiles += 1;
        updateStats();
        sendToContentForge('profile', response.data);
        showFeedback('scrapeProfile', '✅ Profile captured');
      }
    });
  });
});

// Send to OpenClaw
document.getElementById('sendToClaw').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrape_feed' }, (response) => {
      if (response?.data) {
        sendToContentForge('openclaw', response.data);
        showFeedback('sendToClaw', '🦀 Sent to OpenClaw');
      }
    });
  });
});

function updateStats() {
  document.getElementById('postsScraped').textContent = stats.posts;
  document.getElementById('profilesScraped').textContent = stats.profiles;
  chrome.storage.local.set({ cf_stats: stats });
}

function showFeedback(btnId, text) {
  const btn = document.getElementById(btnId);
  const original = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = original; }, 2000);
}

async function sendToContentForge(type, data) {
  const { cf_server } = await chrome.storage.local.get(['cf_server']);
  const serverUrl = cf_server || 'http://localhost:3001';

  try {
    await fetch(`${serverUrl}/api/extension/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data, timestamp: Date.now() }),
    });
  } catch (e) {
    console.warn('Content Forge not reachable:', e);
  }
}
