const { shareSession, generateShareText, generateShareMarkdown } = require('./share');

/**
 * Copy session URLs to clipboard-friendly format (one URL per line)
 */
function copyUrlsToClipboard(session) {
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error('Invalid session');
  }
  return session.tabs.map(tab => tab.url).join('\n');
}

/**
 * Copy session as plain text (title + url per tab)
 */
function copyAsText(session) {
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error('Invalid session');
  }
  const lines = [`Session: ${session.name}`, ''];
  session.tabs.forEach((tab, i) => {
    lines.push(`${i + 1}. ${tab.title || tab.url}`);
    lines.push(`   ${tab.url}`);
  });
  return lines.join('\n');
}

/**
 * Copy session as markdown
 */
function copyAsMarkdown(session) {
  return generateShareMarkdown(session);
}

/**
 * Copy a single tab as text
 */
function copyTab(tab) {
  if (!tab || !tab.url) {
    throw new Error('Invalid tab');
  }
  if (tab.title) {
    return `${tab.title}\n${tab.url}`;
  }
  return tab.url;
}

/**
 * Parse pasted URLs (one per line) into tab objects
 */
function parseClipboardUrls(text) {
  if (typeof text !== 'string') {
    throw new Error('Expected a string');
  }
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.startsWith('http'))
    .map(url => ({ url, title: url, pinned: false }));
}

module.exports = { copyUrlsToClipboard, copyAsText, copyAsMarkdown, copyTab, parseClipboardUrls };
