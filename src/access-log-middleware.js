// access-log-middleware.js — wrap session ops to auto-record access

const { recordAccess } = require('./access-log');
const { loadSession, saveSession } = require('./storage');

/**
 * Wraps a function that returns a session, recording access before returning.
 * @param {Function} fn - async (name, ...args) => session
 * @param {string} action - label for the access type
 */
function withAccessLog(fn, action = 'view') {
  return async function (name, ...args) {
    const session = await fn(name, ...args);
    if (!session) return session;
    const updated = recordAccess(session, action);
    await saveSession(updated);
    return updated;
  };
}

/**
 * Wraps a session mutating function to record a 'write' access.
 * @param {Function} fn - async (session, ...args) => updatedSession
 */
function withWriteLog(fn) {
  return async function (session, ...args) {
    const result = await fn(session, ...args);
    if (!result) return result;
    return recordAccess(result, 'write');
  };
}

/**
 * Apply access logging to a map of named session operations.
 * @param {Object} ops - { opName: { fn, action } }
 */
function applyAccessLogging(ops) {
  const wrapped = {};
  for (const [key, { fn, action }] of Object.entries(ops)) {
    wrapped[key] = withAccessLog(fn, action);
  }
  return wrapped;
}

module.exports = { withAccessLog, withWriteLog, applyAccessLogging };
