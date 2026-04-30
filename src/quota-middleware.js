// quota-middleware.js — wraps session/tab creation with quota enforcement

const { guardSessionQuota, guardTabQuota } = require('./quota');
const { getAllSessions } = require('./sessions');

/**
 * Wraps a function that creates a new session, enforcing the session quota.
 * @param {Function} fn - async fn(...args) => session
 */
function withSessionQuota(fn) {
  return async function (...args) {
    const sessions = await getAllSessions();
    await guardSessionQuota(sessions);
    return fn(...args);
  };
}

/**
 * Wraps a function that adds a tab to an existing session, enforcing tab quota.
 * The wrapped function must receive the session as its first argument.
 * @param {Function} fn - async fn(session, ...args) => result
 */
function withTabQuota(fn) {
  return async function (session, ...args) {
    await guardTabQuota(session);
    return fn(session, ...args);
  };
}

/**
 * Applies quota guards to a sessions API object.
 * Wraps `createSession` and `addTab` if present.
 */
function applyQuotaMiddleware(api) {
  const wrapped = { ...api };
  if (typeof api.createSession === 'function') {
    wrapped.createSession = withSessionQuota(api.createSession);
  }
  if (typeof api.addTab === 'function') {
    wrapped.addTab = withTabQuota(api.addTab);
  }
  return wrapped;
}

module.exports = { withSessionQuota, withTabQuota, applyQuotaMiddleware };
