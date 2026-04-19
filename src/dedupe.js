const { searchByUrl } = require('./search');

/**
 * Find duplicate tabs within a single session (same URL)
 */
function findDuplicatesInSession(session) {
  const seen = new Map();
  const duplicates = [];

  for (const tab of session.tabs) {
    const url = tab.url.trim().toLowerCase();
    if (seen.has(url)) {
      duplicates.push(tab);
    } else {
      seen.set(url, tab);
    }
  }

  return duplicates;
}

/**
 * Remove duplicate tabs from a session, keeping first occurrence
 */
function dedupeSession(session) {
  const seen = new Set();
  const uniqueTabs = [];

  for (const tab of session.tabs) {
    const url = tab.url.trim().toLowerCase();
    if (!seen.has(url)) {
      seen.add(url);
      uniqueTabs.push(tab);
    }
  }

  return { ...session, tabs: uniqueTabs };
}

/**
 * Find tabs that appear across multiple sessions
 */
function findCrossSessionDuplicates(sessions) {
  const urlMap = new Map();

  for (const session of sessions) {
    for (const tab of session.tabs) {
      const url = tab.url.trim().toLowerCase();
      if (!urlMap.has(url)) {
        urlMap.set(url, []);
      }
      urlMap.get(url).push({ sessionName: session.name, tab });
    }
  }

  const duplicates = {};
  for (const [url, entries] of urlMap.entries()) {
    if (entries.length > 1) {
      duplicates[url] = entries;
    }
  }

  return duplicates;
}

module.exports = { findDuplicatesInSession, dedupeSession, findCrossSessionDuplicates };
