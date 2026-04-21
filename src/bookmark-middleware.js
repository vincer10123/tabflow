const { bookmarkTab, unbookmarkTab } = require('./bookmark');
const { saveSession } = require('./storage');

/**
 * Wraps session mutation functions with automatic bookmark persistence.
 * If the wrapped function throws, the error is propagated without saving.
 */
function withBookmarkPersist(fn, sessionName) {
  return async function (...args) {
    let result;
    try {
      result = await fn(...args);
    } catch (err) {
      throw new Error(`Bookmark operation failed: ${err.message}`);
    }
    if (result && result.tabs) {
      try {
        await saveSession(sessionName, result);
      } catch (err) {
        throw new Error(`Failed to persist session "${sessionName}": ${err.message}`);
      }
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
