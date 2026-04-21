const { getSession, getAllSessions } = require('./sessions');

/**
 * Add a bookmark (flagged tab) to a session
 */
function bookmarkTab(session, tabIndex) {
  const tabs = session.tabs || [];
  if (tabIndex < 0 || tabIndex >= tabs.length) {
    throw new Error(`Tab index ${tabIndex} out of range`);
  }
  const updated = { ...tabs[tabIndex], bookmarked: true };
  return {
    ...session,
    tabs: tabs.map((t, i) => (i === tabIndex ? updated : t)),
  };
}

/**
 * Remove a bookmark from a tab in a session
 */
function unbookmarkTab(session, tabIndex) {
  const tabs = session.tabs || [];
  if (tabIndex < 0 || tabIndex >= tabs.length) {
    throw new Error(`Tab index ${tabIndex} out of range`);
  }
  const updated = { ...tabs[tabIndex], bookmarked: false };
  return {
    ...session,
    tabs: tabs.map((t, i) => (i === tabIndex ? updated : t)),
  };
}

/**
 * Get all bookmarked tabs from a session
 */
function getBookmarkedTabs(session) {
  return (session.tabs || []).filter((t) => t.bookmarked === true);
}

/**
 * Get all bookmarked tabs across all sessions
 */
function getAllBookmarkedTabs(sessions) {
  const results = [];
  for (const session of sessions) {
    const bookmarked = getBookmarkedTabs(session);
    bookmarked.forEach((tab) => results.push({ sessionName: session.name, tab }));
  }
  return results;
}

/**
 * Check if a tab is bookmarked
 */
function isBookmarked(tab) {
  return tab.bookmarked === true;
}

module.exports = {
  bookmarkTab,
  unbookmarkTab,
  getBookmarkedTabs,
  getAllBookmarkedTabs,
  isBookmarked,
};
