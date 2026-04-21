const { bookmarkTab, unbookmarkTab } = require('./bookmark');
const { saveSession } = require('./storage');

/**
 * Wraps session mutation functions with automatic bookmark persistence
 */
function withBookmarkPersist(fn, sessionName) {
  return async function (...args) {
    const result = await fn(...args);
    if (result && result.tabs) {
      await saveSession(sessionName, result);
    }
    return result;
  };
}

/**
 * Apply bookmark and unbookmark with auto-save
 */
function applyBookmarkTracking(session) {
  return {
    bookmarkTab: withBookmarkPersist(
      (idx) => Promise.resolve(bookmarkTab(session, idx)),
      session.name
    ),
    unbookmarkTab: withBookmarkPersist(
      (idx) => Promise.resolve(unbookmarkTab(session, idx)),
      session.name
    ),
  };
}

module.exports = { withBookmarkPersist, applyBookmarkTracking };
