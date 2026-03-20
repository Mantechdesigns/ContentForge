/* ───── Content Forge Chrome Extension — Content Script ───── */
/* Injected into supported social platforms to extract feed data */

(() => {
  const SCRAPERS = {
    /* ── TikTok ── */
    'tiktok.com': {
      feed() {
        const items = document.querySelectorAll('[data-e2e="recommend-list-item-container"], [class*="DivItemContainer"]');
        return Array.from(items).slice(0, 30).map(el => ({
          text: el.querySelector('[data-e2e="video-desc"], [class*="SpanText"]')?.textContent?.trim() || '',
          author: el.querySelector('[data-e2e="video-author-uniqueid"], a[href*="/@"]')?.textContent?.trim() || '',
          likes: el.querySelector('[data-e2e="like-count"], [class*="StrongText"]')?.textContent?.trim() || '0',
          comments: el.querySelector('[data-e2e="comment-count"]')?.textContent?.trim() || '0',
          shares: el.querySelector('[data-e2e="share-count"]')?.textContent?.trim() || '0',
          url: el.querySelector('a[href*="/video/"]')?.href || '',
          platform: 'TikTok',
        }));
      },
      profile() {
        return {
          name: document.querySelector('[data-e2e="user-title"], h1')?.textContent?.trim() || '',
          handle: document.querySelector('[data-e2e="user-subtitle"], h2')?.textContent?.trim() || '',
          bio: document.querySelector('[data-e2e="user-bio"]')?.textContent?.trim() || '',
          followers: document.querySelector('[data-e2e="followers-count"]')?.textContent?.trim() || '0',
          following: document.querySelector('[data-e2e="following-count"]')?.textContent?.trim() || '0',
          likes: document.querySelector('[data-e2e="likes-count"]')?.textContent?.trim() || '0',
          platform: 'TikTok',
          url: window.location.href,
        };
      },
    },

    /* ── Instagram ── */
    'instagram.com': {
      feed() {
        const articles = document.querySelectorAll('article');
        return Array.from(articles).slice(0, 20).map(el => ({
          text: el.querySelector('span[class*="x193iq5w"]')?.textContent?.trim() || el.querySelector('img')?.alt || '',
          author: el.querySelector('a[class*="x1i10hfl"]')?.textContent?.trim() || '',
          likes: el.querySelector('button[class*="like"] span, section span')?.textContent?.trim() || '0',
          url: el.querySelector('a[href*="/p/"], a[href*="/reel/"]')?.href || '',
          platform: 'Instagram',
        }));
      },
      profile() {
        const stats = document.querySelectorAll('li span[class*="x5n08af"]');
        return {
          name: document.querySelector('header h2, header span[class*="x1lliihq"]')?.textContent?.trim() || '',
          handle: '@' + (window.location.pathname.replace(/\//g, '') || ''),
          bio: document.querySelector('header section > div > span, [class*="-vDjCf"]')?.textContent?.trim() || '',
          posts: stats[0]?.textContent?.trim() || '0',
          followers: stats[1]?.textContent?.trim() || '0',
          following: stats[2]?.textContent?.trim() || '0',
          platform: 'Instagram',
          url: window.location.href,
        };
      },
    },

    /* ── YouTube ── */
    'youtube.com': {
      feed() {
        const videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');
        return Array.from(videos).slice(0, 20).map(el => ({
          text: el.querySelector('#video-title')?.textContent?.trim() || '',
          author: el.querySelector('#text.ytd-channel-name a, ytd-channel-name a')?.textContent?.trim() || '',
          views: el.querySelector('#metadata-line span')?.textContent?.trim() || '0',
          url: el.querySelector('a#video-title-link, a#thumbnail')?.href || '',
          platform: 'YouTube',
        }));
      },
      profile() {
        return {
          name: document.querySelector('#channel-name yt-formatted-string, ytd-channel-name yt-formatted-string')?.textContent?.trim() || '',
          handle: document.querySelector('#channel-handle, yt-formatted-string[id="channel-handle"]')?.textContent?.trim() || '',
          subscribers: document.querySelector('#subscriber-count')?.textContent?.trim() || '0',
          bio: document.querySelector('#description-container yt-formatted-string')?.textContent?.trim() || '',
          platform: 'YouTube',
          url: window.location.href,
        };
      },
    },

    /* ── X (Twitter) ── */
    'x.com': {
      feed() {
        const tweets = document.querySelectorAll('article[data-testid="tweet"]');
        return Array.from(tweets).slice(0, 20).map(el => ({
          text: el.querySelector('[data-testid="tweetText"]')?.textContent?.trim() || '',
          author: el.querySelector('[data-testid="User-Name"] a')?.textContent?.trim() || '',
          likes: el.querySelector('[data-testid="like"] span')?.textContent?.trim() || '0',
          retweets: el.querySelector('[data-testid="retweet"] span')?.textContent?.trim() || '0',
          replies: el.querySelector('[data-testid="reply"] span')?.textContent?.trim() || '0',
          url: el.querySelector('a[href*="/status/"]')?.href || '',
          platform: 'X',
        }));
      },
      profile() {
        return {
          name: document.querySelector('[data-testid="UserName"] span span')?.textContent?.trim() || '',
          handle: window.location.pathname,
          bio: document.querySelector('[data-testid="UserDescription"]')?.textContent?.trim() || '',
          followers: document.querySelector('a[href*="/followers"] span')?.textContent?.trim() || '0',
          following: document.querySelector('a[href*="/following"] span')?.textContent?.trim() || '0',
          platform: 'X',
          url: window.location.href,
        };
      },
    },

    /* ── LinkedIn ── */
    'linkedin.com': {
      feed() {
        const posts = document.querySelectorAll('.feed-shared-update-v2');
        return Array.from(posts).slice(0, 15).map(el => ({
          text: el.querySelector('.feed-shared-update-v2__description, .feed-shared-text')?.textContent?.trim() || '',
          author: el.querySelector('.feed-shared-actor__name span')?.textContent?.trim() || '',
          likes: el.querySelector('.social-details-social-counts__reactions-count')?.textContent?.trim() || '0',
          url: el.querySelector('a[href*="/feed/update/"]')?.href || '',
          platform: 'LinkedIn',
        }));
      },
      profile() {
        return {
          name: document.querySelector('.text-heading-xlarge, h1')?.textContent?.trim() || '',
          headline: document.querySelector('.text-body-medium')?.textContent?.trim() || '',
          location: document.querySelector('.text-body-small.inline')?.textContent?.trim() || '',
          connections: document.querySelector('span.t-bold')?.textContent?.trim() || '0',
          platform: 'LinkedIn',
          url: window.location.href,
        };
      },
    },
  };

  // Also map twitter.com to x.com scraper
  SCRAPERS['twitter.com'] = SCRAPERS['x.com'];

  // Find active scraper
  function getActiveScraper() {
    const host = window.location.hostname.replace('www.', '');
    for (const [domain, scraper] of Object.entries(SCRAPERS)) {
      if (host.includes(domain.replace('www.', ''))) return scraper;
    }
    return null;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const scraper = getActiveScraper();
    if (!scraper) {
      sendResponse({ error: 'No scraper for this platform' });
      return true;
    }

    if (message.action === 'scrape_feed') {
      try {
        const data = scraper.feed();
        sendResponse({ data, count: data.length });
      } catch (e) {
        sendResponse({ error: e.message, data: [] });
      }
    }

    if (message.action === 'scrape_profile') {
      try {
        const data = scraper.profile();
        sendResponse({ data });
      } catch (e) {
        sendResponse({ error: e.message, data: null });
      }
    }

    return true; // Keep message channel open for async
  });
})();
