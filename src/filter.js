// Filter tabs and sessions by various criteria

/**
 * Filter tabs in a session by a predicate
 */
function filterTabs(session, predicate) {
  return {
    ...session,
    tabs: session.tabs.filter(predicate),
  };
}

/**
 * Filter tabs by pinned status
 */
function filterByPinned(session, pinned = true) {
  return filterTabs(session, (tab) => Boolean(tab.pinned) === pinned);
}

/**
 * Filter tabs by tag
 */
function filterByTag(session, tag) {
  return filterTabs(session, (tab) => Array.isArray(tab.tags) && tab.tags.includes(tag));
}

/**
 * Filter tabs by domain extracted from URL
 */
function filterByDomain(session, domain) {
  return filterTabs(session, (tab) => {
    try {
      const url = new URL(tab.url);
      return url.hostname === domain || url.hostname.endsWith('.' + domain);
    } catch {
      return false;
    }
  });
}

/**
 * Filter sessions by minimum tab count
 */
function filterSessionsByMinTabs(sessions, min) {
  return sessions.filter((s) => Array.isArray(s.tabs) && s.tabs.length >= min);
}

/**
 * Filter sessions by tag (session has at least one tab with the tag)
 */
function filterSessionsByTag(sessions, tag) {
  return sessions.filter((s) =>
    Array.isArray(s.tabs) && s.tabs.some((tab) => Array.isArray(tab.tags) && tab.tags.includes(tag))
  );
}

module.exports = {
  filterTabs,
  filterByPinned,
  filterByTag,
  filterByDomain,
  filterSessionsByMinTabs,
  filterSessionsByTag,
};
