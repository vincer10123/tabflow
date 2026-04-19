const { addHistoryEntry } = require('./history');

/**
 * Wraps session operations to automatically record history entries.
 */
function withHistory(action, fn) {
  return async function (sessionName, ...args) {
    const result = await fn(sessionName, ...args);
    await addHistoryEntry(action, sessionName).catch(() => {});
    return result;
  };
}

function applyHistoryTracking(sessions) {
  return {
    ...sessions,
    createSession: withHistory('create', sessions.createSession),
    removeSession: withHistory('delete', sessions.removeSession),
    getSession: withHistory('open', sessions.getSession),
  };
}

module.exports = { withHistory, applyHistoryTracking };
