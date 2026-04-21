const { getAllSessions } = require('./sessions');

const DEFAULT_LIMIT = 10;

/**
 * Get recently created sessions, sorted by createdAt descending.
 * @param {number} limit - max number of sessions to return
 * @returns {Array} sorted session list
 */
function getRecentSessions(limit = DEFAULT_LIMIT) {
  const sessions = getAllSessions();
  return sessions
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

/**
 * Get recently modified sessions, sorted by updatedAt descending.
 * Falls back to createdAt if updatedAt is not set.
 * @param {number} limit
 * @returns {Array}
 */
function getRecentlyModifiedSessions(limit = DEFAULT_LIMIT) {
  const sessions = getAllSessions();
  return sessions
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, limit);
}

/**
 * Get the single most recently accessed session.
 * Considers both updatedAt and createdAt.
 * @returns {object|null}
 */
function getLastSession() {
  const recent = getRecentlyModifiedSessions(1);
  return recent.length > 0 ? recent[0] : null;
}

module.exports = { getRecentSessions, getRecentlyModifiedSessions, getLastSession };
